import React, { useState, MouseEvent } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  MenuItem,
  Menu,
} from "@material-ui/core";
import {
  Lock as LockIcon,
  ExitToApp as ExitToAppIcon,
  AccountCircle,
  MoreVert as MoreIcon,
} from "@material-ui/icons";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { useNavigate, useLocation } from "react-router-dom";
import { Search } from "./Search";
import { useRequest } from "../hooks";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    grow: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    logoBlock: {
      display: "flex",
      alignItems: "center",
      marginLeft: "3%",
    },
    logo: {
      cursor: "pointer",
    },
    title: {
      display: "none",
      [theme.breakpoints.up("sm")]: {
        display: "block",
        marginLeft: "8px",
      },
    },
    sectionDesktop: {
      display: "none",
      [theme.breakpoints.up("md")]: {
        display: "block",
      },
    },
    sectionMobile: {
      display: "block",
      marginRight: "-12px",
      [theme.breakpoints.up("md")]: {
        display: "none",
      },
    },
  }),
);

export const Navbar = () => {
  const { request } = useRequest();
  const navigate = useNavigate();
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    useState<null | HTMLElement>(null);
  const { pathname } = useLocation();

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const isMainPage = pathname === "/";
  const handleProfileMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleOut = async (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();

    const response = await request("/api/auth/logout", { method: "POST" });
    if (response?.status === "loggedOut") {
      sessionStorage.removeItem("csrfToken");
      navigate("/sign-in");
    }
    handleMenuClose();
  };

  const handleLogoClick = () => window.location.reload();

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      {isMainPage ? (
        <MenuItem onClick={handleOut}>
          <ExitToAppIcon />
          <span>Log out</span>
        </MenuItem>
      ) : (
        <MenuItem onClick={handleMenuClose}>
          <LockIcon data-testid="lock-icon" />
        </MenuItem>
      )}
    </Menu>
  );

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  return (
    <div className={classes.grow}>
      <AppBar position="fixed">
        <Toolbar>
          <div className={classes.logoBlock}>
            <img
              data-testid="logo-img"
              className={classes.logo}
              src="/logo.png"
              alt="logo"
              width="48"
              onClick={handleLogoClick}
            />
            <Typography className={classes.title} variant="h5" noWrap>
              Drop notes
            </Typography>
          </div>
          {isMainPage && <Search />}
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            <IconButton
              data-testid="profile-icon"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </div>
          <div className={classes.sectionMobile}>
            <IconButton
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
    </div>
  );
};
