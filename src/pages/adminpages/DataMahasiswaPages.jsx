import React ,{useEffect} from 'react'
import {Layout} from '../../layout/Layout'
import { DataMahasiswa } from '../../component/admin/DataMahasiswa';
import {  useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export const DataMahasiswaPages = () => {

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
            <DataMahasiswa />
        </Layout>
  )
}
