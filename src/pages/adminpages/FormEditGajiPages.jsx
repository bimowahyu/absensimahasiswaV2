import React,{useEffect} from 'react'
import { FormEditGaji } from '../../component/admin/FormEditGaji';
import {Layout} from '../../layout/Layout'
import {  useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export const FormEditGajiPages = () => {

    const navigate = useNavigate();
    const { isError } = useSelector((state) => state.authAdmin);

    useEffect(() => {
        if (isError) {
          navigate("/admin");
        }
      }, [isError, navigate]);

  return (
    <Layout>
<FormEditGaji />
    </Layout>
  )
}
