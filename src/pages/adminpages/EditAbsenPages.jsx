import React,{useEffect} from 'react'
import { FormEditAbsensi } from '../../component/admin/FormEditAbsensi';
import {Layout} from '../../layout/Layout'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export const EditAbsenPages = () => {
    const navigate = useNavigate();
  const { isError } = useSelector((state) => state.authAdmin);
  useEffect(() => {
    if (isError) {
      navigate("/editdata");
    }
  }, [isError, navigate]);
  return (
    <Layout>
        <FormEditAbsensi />
    </Layout>
  )
}
