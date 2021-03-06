import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
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
import Container from "@material-ui/core/Container";
import Loader from "../components/Loader";
import { makeStyles } from "@material-ui/core/styles";
import { StoreContext } from "../appStore";
import { useRequest } from "../hooks";
import { isNoFormErrors, validate } from "../utils";
import { LoaderTypes } from "../types";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(16),
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
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const SignUpPage = () => {
  const classes = useStyles();
  const { logIn, setNotification } = useContext(StoreContext);

  const { request, isLoading, error, clearError } = useRequest();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({ email: "", password: "" });

  useEffect(() => {
    if (error) {
      setNotification({
        isOpen: true,
        message: error,
        severity: "error",
      });
      clearError();
    }
  }, [error, clearError, setNotification]);

  const changeHandler = useCallback(
    (event: ChangeEvent<HTMLFormElement>) => {
      setForm({
        ...form,
        [event.target.name]: event.target.value,
      });

      if (formErrors.email !== "" && event.target.name === "email") {
        setFormErrors({ ...formErrors, email: "" });
      }
      if (formErrors.password !== "" && event.target.name === "password") {
        setFormErrors({ ...formErrors, password: "" });
      }
    },
    [form, setForm, formErrors, setFormErrors]
  );

  const signUpHandler = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();

      const errors = validate({ email: form.email, password: form.password });
      if (isNoFormErrors(errors)) {
        try {
          const signUpData = await request("/api/auth/register", "POST", {
            ...form,
          });

          setNotification({
            isOpen: true,
            message: signUpData.message,
            severity: "success",
          });

          const signIndData = await request("/api/auth/login", "POST", {
            email: form.email,
            password: form.password,
          });

          logIn(signIndData.token, signIndData.userId);
        } catch (e) {}
      } else {
        setFormErrors(errors);
      }
    },
    [form, logIn, request, setNotification]
  );

  return (
    <>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <form
            className={classes.form}
            onSubmit={signUpHandler}
            onChange={changeHandler}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="fname"
                  name="firstName"
                  variant="outlined"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="lname"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              disabled={isLoading}
            >
              Sign Up
            </Button>
            <Grid container justify="flex-end">
              <Grid item>
                <Link href="/sign-in" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </form>
        </div>
      </Container>
      {isLoading && <Loader type={LoaderTypes.dots} />}
    </>
  );
};

export default SignUpPage;
