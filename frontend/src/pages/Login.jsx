import React, { useContext, useState } from 'react'; 
import { Container, Row, Col, Form, FormGroup, Button, Alert } from 'reactstrap';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/login.css';

import loginImg from '../assets/images/login2.png';
import userIcon from '../assets/images/user11.png';

import { AuthContext } from './../context/AuthContext';
import { BASE_URL } from "../utils/config";

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [showRegisterMessage, setShowRegisterMessage] = useState(false);

  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = e => {
    setCredentials(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async e => {
    e.preventDefault();

    dispatch({ type: 'LOGIN_START' });

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'post',
        headers: {
          'content-type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });

      const result = await res.json();
      
      if (!res.ok) {
        // Check if the error is related to user not found
        if (result.message === "User not found") {
          setShowRegisterMessage(true);
        } else {
          alert(result.message);
        }
        dispatch({ type: 'LOGIN_FAILURE', payload: result.message });
        return;
      }

      dispatch({ type: 'LOGIN_SUCCESS', payload: result.data });
      navigate('/');
    } catch (err) {
      dispatch({ type: 'LOGIN_FAILURE', payload: err.message });
    }
  };

  const isCredentialsFilled = credentials.email && credentials.password;

  return (
    <section>
      <Container>
        <Row>
          <Col lg="8" className="m-auto">
            <div className="login__container d-flex justify-content-between">
              <div className="logo__img">
                <img src={loginImg} alt="Login illustration" />
              </div>

              <div className='login__form'>
                <div className="user">
                  <img src={userIcon} alt="User icon" />
                </div>
                <h2>Login</h2>
                
                {showRegisterMessage && (
                  <Alert color="warning" className="register-alert">
                    <i className="ri-information-line mr-2"></i>
                    It seems you haven't registered yet. Please register first before attempting to login.
                    <div className="mt-2">
                      <Link to="/register" className="btn btn-sm btn-outline-primary">
                        <i className="ri-user-add-line"></i> Register Now
                      </Link>
                    </div>
                  </Alert>
                )}

                <Form onSubmit={handleClick}>
                  <FormGroup>
                    <input type="email" placeholder="Email" required id="email"
                      onChange={handleChange} />
                  </FormGroup>
                  <FormGroup>
                    <input type="password" placeholder="Password" required id="password"
                      onChange={handleChange} />
                  </FormGroup>
                  <Button
                    className={` btn auth__btn ${isCredentialsFilled ? 'filled' : 'empty'}`}
                    type="submit"
                  >
                    Login
                  </Button>
                </Form>
                <p>Don't have an account? <Link to='/register'> Create</Link></p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Login;