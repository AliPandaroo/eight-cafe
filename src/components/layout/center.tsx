import { Flex, type FlexProps } from "./flex"

export type CenterProps = FlexProps

/** Centers children horizontally and vertically. */
export function Center(props: CenterProps) {
  return <Flex align="center" justify="center" {...props} />
}
