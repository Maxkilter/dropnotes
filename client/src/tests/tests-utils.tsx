import { StoreContext } from "../appStore";
import { render } from "@testing-library/react";
import { mockStore } from "./moks";

export const customRender = (
  ui: object,
  { providerProps, ...renderOptions }: any
) => {
  return render(
    <StoreContext.Provider value={providerProps ? providerProps : mockStore}>
      {ui}
    </StoreContext.Provider>,
    renderOptions
  );
};
