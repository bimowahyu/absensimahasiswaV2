import React ,{useEffect} from 'react'
import {Layout} from '../../layout/Layout'
import { DataKaryawan } from '../../component/admin/DataKaryawan';
import {  useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export const DataKaryawanPages = () => {

    const navigate = useNavigate();
    const { isError } = useSelector((state) => state.authAdmin);
  
    // useEffect(() => {
    //   dispatch(getMe());
    // }, [dispatch]);
  
    useEffect(() => {
      if (isError) {
        navigate("/");
      }
    }, [isError, navigate]);;

  return (
        <Layout>
            <DataKaryawan />
        </Layout>
  )
}
