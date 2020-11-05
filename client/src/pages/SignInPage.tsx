import React, {
  ChangeEvent,
  FormEvent,
  useContext,
  useEffect,
  useState,
} from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Notification from "../components/Notification";
import { Color } from "@material-ui/lab";
import { useRequest } from "../hooks/useRequest";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const SignInPage = () => {
  const classes = useStyles();
  const auth = useContext(AuthContext);
  const { isLoading, request, error, clearError } = useRequest();

  const [notification, setNotification] = useState({
    isOpen: false,
    message: "",
    severity: "info" as Color,
  });

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (error) {
      setNotification({
        isOpen: true,
        message: error,
        severity: "error",
      });
      clearError();
    }
  }, [error, clearError]);

  const signInHandler = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const data = await request("/api/auth/login", "POST", { ...form });
      auth.logIn(data.token, data.userId);
    } catch (e) {}
  };

  const changeHandler = (event: ChangeEvent<HTMLFormElement>) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <form
            className={classes.form}
            onSubmit={signInHandler}
            onChange={changeHandler}
          >
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              disabled={isLoading}
            >
              Sign In
            </Button>
            <Grid container justify="flex-end">
              <Grid item>
                <Link href="/sign-up" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </form>
        </div>
      </Container>
      <Notification
        isOpen={notification.isOpen}
        setIsOpen={setNotification}
        message={notification.message}
        severity={notification.severity}
      />
    </>
  );
};

export default SignInPage;
