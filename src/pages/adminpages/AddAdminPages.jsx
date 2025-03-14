import React ,{useEffect} from 'react'
import {Layout} from '../../layout/Layout'
import { FormAddAdmin } from '../../component/admin/FormAddAdmin';
import {  useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export const AddAdminPages = () => {
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
    <FormAddAdmin />
   </Layout>
  )
}
