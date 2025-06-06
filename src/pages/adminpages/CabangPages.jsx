import React ,{useEffect} from 'react'
import {Layout} from '../../layout/Layout'
import { Datacabang } from '../../component/admin/Datacabang'
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export const CabangPages = () => {
    //const dispatch = useDispatch();
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
        <Datacabang />
        </Layout>
  )
}
