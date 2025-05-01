import React,{useEffect} from 'react'
import { FormEditMahasiswa } from '../../component/admin/FormEditMahasiswa';
import {Layout} from '../../layout/Layout'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export const EditMahasiswaPages = () => {
    const navigate = useNavigate();
    const { isError } = useSelector((state) => state.authAdmin);
  
    // useEffect(() => {
    //   dispatch(getMe());
    // }, [dispatch]);
  
    useEffect(() => {
      if (isError) {
        navigate("/datamahasiswa");
      }
    }, [isError, navigate]);
  return (
    <Layout>
    <FormEditMahasiswa />
</Layout>
  )
}
