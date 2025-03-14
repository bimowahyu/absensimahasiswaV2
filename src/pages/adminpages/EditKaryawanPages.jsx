import React,{useEffect} from 'react'
import { FormEditKaryawan } from '../../component/admin/FormEditKaryawan';
import {Layout} from '../../layout/Layout'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export const EditKaryawanPages = () => {
    const navigate = useNavigate();
    const { isError } = useSelector((state) => state.authAdmin);
  
    // useEffect(() => {
    //   dispatch(getMe());
    // }, [dispatch]);
  
    useEffect(() => {
      if (isError) {
        navigate("/datakaryawan");
      }
    }, [isError, navigate]);
  return (
    <Layout>
    <FormEditKaryawan />
</Layout>
  )
}
