import { Flex, type FlexProps } from "./flex";

export type StackProps = Omit<FlexProps, "direction"> & {
  direction?: FlexProps["direction"];
};

/** Vertical flex container — `direction="col"` by default. */
export function Stack({ direction = "col", ...props }: StackProps) {
  return <Flex direction={direction} {...props} />;
}
