import React ,{useEffect} from 'react'
import {Layout} from '../../layout/Layout'
import { CreateKaryawan } from '../../component/admin/FromAddKaryawan';
import {  useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export const CreateKaryawanPages = () => {
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
        <CreateKaryawan />
        </Layout>
  )
}
