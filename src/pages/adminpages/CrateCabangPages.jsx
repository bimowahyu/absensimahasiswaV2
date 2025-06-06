import React ,{useEffect} from 'react'
import {Layout} from '../../layout/Layout'
import { CreateCabang } from '../../component/admin/CreateCabang';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export const TambahCabangPages = () => {
  const navigate = useNavigate();
  const { isError } = useSelector((state) => state.authAdmin);

  // useEffect(() => {
  //   dispatch(getMe());
  // }, [dispatch]);

  useEffect(() => {
    if (isError) {
      navigate("/");
    }
  }, [isError, navigate]);
  return (
   <Layout>
    <CreateCabang />
   </Layout>
  )
}
