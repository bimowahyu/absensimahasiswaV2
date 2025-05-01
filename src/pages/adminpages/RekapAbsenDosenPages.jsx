import React, { useEffect } from "react";
import {Layout} from '../../layout/Layout'
import { RekapAbsenDosen } from "../../component/admin/RekapAbsenDosen";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
//import { getMe } from "../../fitur/AuthSlice";
import { getMeAdmin } from "../../fitur/AuthSlice";

const RekapAbsenDosenPages = () => {
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
      <RekapAbsenDosen />
    </Layout>
  );
};

export default RekapAbsenDosenPages;