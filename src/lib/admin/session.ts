import { createHash, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import type { PublicRole, StaffRole } from "@/lib/auth/roles"
import { homeForRole } from "@/lib/auth/roles"

export type { PublicRole, StaffRole } from "@/lib/auth/roles"
export { homeForRole }

const COOKIE_NAME = "menup_staff"
const LEGACY_COOKIE = "menup_admin"

export type StaffSession = {
  role: StaffRole
}

function getManagerPassword() {
  return process.env.MANAGER_PASSWORD || process.env.ADMIN_PASSWORD || "eight"
}

function getWaiterPassword() {
  return process.env.WAITER_PASSWORD || "waiter"
}

function hashToken(role: StaffRole) {
  const secret =
    role === "manager" ? getManagerPassword() : getWaiterPassword()

  return createHash("sha256").update(`menup:${role}:${secret}`).digest("hex")
}

function tokensMatch(value: string, expected: string) {
  const received = Buffer.from(value)
  const target = Buffer.from(expected)

  if (received.length !== target.length) {
    return false
  }

  return timingSafeEqual(received, target)
}

function passwordsMatch(received: string, expected: string) {
  const left = Buffer.from(received)
  const right = Buffer.from(expected)

  if (left.length !== right.length) {
    return false
  }

  return timingSafeEqual(left, right)
}

function parseStaffCookie(value: string): StaffSession | null {
  const separator = value.indexOf(".")

  if (separator <= 0) {
    return null
  }

  const role = value.slice(0, separator)
  const token = value.slice(separator + 1)

  if (role !== "manager" && role !== "waiter") {
    return null
  }

  if (!tokensMatch(token, hashToken(role))) {
    return null
  }

  return { role }
}

export async function getStaffSession(): Promise<StaffSession | null> {
  const store = await cookies()
  const current = store.get(COOKIE_NAME)?.value

  if (current) {
    return parseStaffCookie(current)
  }

  const legacy = store.get(LEGACY_COOKIE)?.value

  if (legacy && tokensMatch(legacy, hashToken("manager"))) {
    return { role: "manager" }
  }

  return null
}

export async function getPublicRole(): Promise<PublicRole> {
  const session = await getStaffSession()
  return session?.role ?? "customer"
}

export async function isAdminAuthenticated() {
  return Boolean(await getStaffSession())
}

export async function requireStaff() {
  const session = await getStaffSession()

  if (!session) {
    redirect("/admin/login")
  }

  return session
}

export async function requireManager() {
  const session = await requireStaff()

  if (session.role !== "manager") {
    redirect("/admin/prefactors")
  }

  return session
}

export async function createStaffSession(role: StaffRole) {
  const store = await cookies()
  store.set(COOKIE_NAME, `${role}.${hashToken(role)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  })
  store.delete(LEGACY_COOKIE)
}

export async function createAdminSession() {
  await createStaffSession("manager")
}

export async function clearAdminSession() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
  store.delete(LEGACY_COOKIE)
}

export function verifyStaffPassword(role: StaffRole, password: string) {
  const expected =
    role === "manager" ? getManagerPassword() : getWaiterPassword()

  return passwordsMatch(password, expected)
}

export function verifyAdminPassword(password: string) {
  return verifyStaffPassword("manager", password)
}

