import React, { useState, useCallback, useRef } from "react";
import SearchIcon from "@material-ui/icons/Search";
import ClearIcon from "@material-ui/icons/Clear";
import InputBase from "@material-ui/core/InputBase";
import {
  createStyles,
  alpha,
  makeStyles,
  Theme,
} from "@material-ui/core/styles";
import { debounce, DebouncedFunc } from "lodash";
import { useNoteAction } from "../hooks";
import Loader from "./Loader";
import { LoaderTypes } from "../types";
import { setFocus } from "../utils";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    search: {
      position: "relative",
      borderRadius: theme.shape.borderRadius,
      backgroundColor: alpha(theme.palette.common.white, 0.15),
      "&:hover": {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
      },
      marginRight: theme.spacing(2),
      marginLeft: theme.spacing(1),
      width: "100%",
      [theme.breakpoints.up("sm")]: {
        marginLeft: theme.spacing(3),
        width: "auto",
      },
    },
    searchIcon: {
      padding: theme.spacing(0, 2),
      height: "100%",
      position: "absolute",
      pointerEvents: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    inputRoot: {
      color: "inherit",
      width: "28ch",
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
      transition: theme.transitions.create("width"),
      width: "100%",
      [theme.breakpoints.up("md")]: {
        width: "20ch",
      },
    },
    clearIcon: {
      cursor: "pointer",
      position: "absolute",
      top: 7,
      right: 5,
    },
  })
);

const Search = () => {
  const classes = useStyles();
  const [prevSearchFn, setPrevSearchFn] = useState<DebouncedFunc<
    (query: string) => Promise<void>
  > | null>(null);
  const [prevQuery, setPrevQuery] = useState("");
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLDivElement>(null);

  const { searchNotes, fetchNotes, isLoading } = useNoteAction();

  const sendQuery = useCallback(
    async (query: string) => {
      setPrevQuery(query);

      if (query !== prevQuery) await searchNotes(query);
    },
    [searchNotes, prevQuery]
  );

  const handleDebouncedSearch = useCallback(
    ({ target: { value } }) => {
      setQuery(value);
      const searchFn = debounce(sendQuery, 500);

      setPrevSearchFn(() => {
        if (prevSearchFn?.cancel) prevSearchFn.cancel();
        return searchFn;
      });
      return value ? searchFn(value) : fetchNotes();
    },
    [sendQuery, prevSearchFn, fetchNotes]
  );

  const clearSearch = useCallback(() => {
    setFocus(searchInputRef);
    setPrevQuery("");
    setQuery("");
    fetchNotes();
  }, [fetchNotes]);

  return (
    <>
      <div className={classes.search} data-testid="search">
        <div className={classes.searchIcon}>
          <SearchIcon />
        </div>
        <InputBase
          inputRef={searchInputRef}
          placeholder="Search…"
          classes={{
            root: classes.inputRoot,
            input: classes.inputInput,
          }}
          inputProps={{ "aria-label": "search" }}
          onChange={handleDebouncedSearch}
          value={query}
        />
        {!!query && (
          <ClearIcon
            className={classes.clearIcon}
            fontSize="small"
            onClick={clearSearch}
          />
        )}
      </div>
      {isLoading && <Loader type={LoaderTypes.dots} />}
    </>
  );
};

export default Search;
