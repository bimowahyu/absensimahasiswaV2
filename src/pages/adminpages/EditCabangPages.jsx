import React,{useEffect} from 'react'
import { FormEditCabang } from '../../component/admin/FormEditCabang'
import {Layout} from '../../layout/Layout'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export const EditCabangPages = () => {
    const navigate = useNavigate();
  const { isError } = useSelector((state) => state.authAdmin);

  // useEffect(() => {
  //   dispatch(getMe());
  // }, [dispatch]);

  useEffect(() => {
    if (isError) {
      navigate("/datalokasi");
    }
  }, [isError, navigate]);
  return (
    <Layout>
        <FormEditCabang />
    </Layout>
  )
}
