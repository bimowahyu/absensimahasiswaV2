import React, { useEffect } from "react";
import AbsenceRequestForm from "../component/AbsenceRequestForm";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../fitur/AuthMahasiswa";

export const AbsenceRequestFormPages = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isError } = useSelector((state) => state.authMahasiswa);
  
    useEffect(() => {
      dispatch(getMe());
    }, [dispatch]);
  
    useEffect(() => {
      if (isError) {
        navigate("/");
      }
    }, [isError, navigate]);
  
  return (
   
    <AbsenceRequestForm />
  
  )
}


