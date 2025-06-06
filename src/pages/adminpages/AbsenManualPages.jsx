import React, { useEffect } from "react";
import {Layout} from '../../layout/Layout'
import { AbsenManual } from "../../component/admin/AbsenManual";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
//import { getMe } from "../../fitur/AuthSlice";
import { getMeAdmin } from "../../fitur/AuthSlice";

export const AbsenManualPages = () => {
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
        <AbsenManual />
    </Layout>
  )
}
