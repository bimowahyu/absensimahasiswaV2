import React,{useState, useEffect} from 'react';
import { NavLink,useNavigate } from "react-router-dom";
//import logo from "../login.jpeg";
import { useDispatch, useSelector } from "react-redux";
//import { useNavigate } from "react-router-dom";
import { IoLogOut } from "react-icons/io5";
//import { LogOut, reset } from '../fitur/AuthSlice';
import { LogOutAdmin, reset } from '../fitur/AuthSlice';
import axios from 'axios';
import "../component/admin/css/navBar.css"
const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
 const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

const NavBar = () => {
  const [dataAdmin, setDataAdmin] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.authAdmin);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${getApiBaseUrl()}/Me`,{withCredentials:true});
        setDataAdmin(response.data);
      } catch (error) {
        setError(error.message);
        if (error.response && error.response.status === 401) {
          dispatch(LogOutAdmin());
          navigate("/loginadmin");
        }
      }
    };

    fetchProfile();
  }, [dispatch, navigate]);

  const logout = () =>{
    dispatch(LogOutAdmin());
    dispatch(reset());
    navigate("/loginadmin");
  }

  return (
    <div>
        <nav className="navbar is-fixed-top has-shadow" role="navigation" aria-label="main navigation">
          <div className="navbar-brand">
            <NavLink className="navbar-item" href="https://bulma.io">
              {/* <img src={logo}
               width="112" height="28"
               alt="logo"
               /> */}
            </NavLink>
        
            {/* <a href='!#' role="button" className="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </a> */}
              {dataAdmin ? (
        <div>
          <p>Login sebagai Admin: {dataAdmin.name}</p>
        </div>
      ) : (
        <div>Loading...</div>
      )}
          </div>
       
          
            <div className="navbar-end">
              <div className="navbar-item">
                <div className="buttons">
                  {/* <button onClick={logout} className="button is-light">
                    
                  </button> */}
                  <button onClick={logout}><IoLogOut /></button>
                </div>
                </div>
              </div>
              </nav>
            </div>
         
    
  )
}

export default NavBar