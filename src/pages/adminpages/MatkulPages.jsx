import React,{useEffect} from 'react'
import DataMatkul from '../../component/admin/DataMatkul';
import {Layout} from '../../layout/Layout'
import {  useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export const MatkulPages = () => {

    const navigate = useNavigate();
    const { isError } = useSelector((state) => state.authAdmin);

    useEffect(() => {
        if (isError) {
          navigate("/admin");
        }
      }, [isError, navigate]);

  return (
    <Layout>
<DataMatkul />
    </Layout>
  )
}
