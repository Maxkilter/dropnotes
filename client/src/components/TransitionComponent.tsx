import React, { forwardRef, ReactElement, Ref } from "react";
import { Slide, SlideProps } from "@material-ui/core";
import { TransitionProps } from "@material-ui/core/transitions";

export const TransitionComponent = forwardRef(
  (
    props: TransitionProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>,
  ) => {
    const directions = ["up", "right", "down", "left"];
    const setDirection = () => {
      const random = Math.floor(Math.random() * directions.length);
      return directions[random] as SlideProps["direction"];
    };
    return <Slide direction={setDirection()} ref={ref} {...props} />;
  },
);
