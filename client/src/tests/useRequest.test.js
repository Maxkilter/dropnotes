import React from "react";
import { renderHook, act } from "@testing-library/react-hooks";
import { useRequest } from "../hooks";

const errorMessage = "some error";

global.fetch = jest.fn();

describe("useRequest hook", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should handle isLoading state", async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
        ok: true,
      })
    );
    const { result, waitForNextUpdate } = renderHook(() => useRequest());

    act(() => {
      result.current.request("/some-url", "GET", null, {});
    });

    expect(result.current.isLoading).toBeTruthy();
    await waitForNextUpdate();
    expect(result.current.isLoading).toBeFalsy();
  });

  it("should make a successful request", async () => {
    const response = { message: "Success" };
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve(response),
        ok: true,
      })
    );
    const { result } = renderHook(() => useRequest());

    await act(async () => {
      const data = await result.current.request("/some-url", "GET", null, {});
      expect(data).toEqual(response);
    });

    expect(result.current.error).toEqual(null);
  });

  it("should handle an unsuccessful request", async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ message: errorMessage }),
        ok: false,
        status: 401,
      })
    );

    const logOut = jest.fn();
    jest.spyOn(React, "useContext").mockImplementation(() => ({ logOut }));

    const { result } = renderHook(() => useRequest());

    await act(async () => {
      try {
        await result.current.request("/some-url", "GET", null, {});
      } catch (error) {}
    });

    expect(logOut).toHaveBeenCalled();
    expect(result.current.error).toEqual(errorMessage);
  });

  it("should clear an error", async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ message: errorMessage }),
        ok: false,
        status: 500,
      })
    );

    const { result } = renderHook(() => useRequest());

    await act(async () => {
      try {
        await result.current.request("/some-url", "GET", null, {});
      } catch (error) {}
    });

    expect(result.current.error).toEqual(errorMessage);

    act(() => result.current.clearError());

    expect(result.current.error).toEqual(null);
  });
});
