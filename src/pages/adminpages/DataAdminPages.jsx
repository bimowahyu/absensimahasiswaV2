import React, { useEffect } from "react";
import {Layout} from '../../layout/Layout'
import DataAdmin from "../../component/admin/DataAdmin";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
//import { getMe } from "../../fitur/AuthSlice";
import { getMeAdmin } from "../../fitur/AuthSlice";


export const DataAdminPages = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isError } = useSelector((state) => state.authAdmin);
  
    useEffect(() => {
      dispatch(getMeAdmin());
    }, [dispatch]);
  
    useEffect(() => {
      if (isError) {
        navigate("/");
      }
    }, [isError, navigate]);
  return (
    <Layout>
        <DataAdmin />
    </Layout>
  )
}
