import React,{useEffect} from 'react'
import { FormEditAdmin } from '../../component/admin/FormEditAdmin';
import {Layout} from '../../layout/Layout'
import {  useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export const FormEditAdminPages = () => {
    const navigate = useNavigate();
    const { isError } = useSelector((state) => state.authAdmin);

    useEffect(() => {
        if (isError) {
          navigate("/admin");
        }
      }, [isError, navigate]);
  return (
  <Layout>
    <FormEditAdmin />
    </Layout>
  )
}
