import React, { useEffect } from "react";
import { FormEditProfile } from "../component/FormEditProfile";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../fitur/AuthMahasiswa";

export const EditprofileMahasiswaPages = () => {
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
    <FormEditProfile />
  )
}
