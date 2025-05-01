import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Container, Row, Col, Form, Button, Card, Spinner } from 'react-bootstrap';
import styled from 'styled-components';
import { FiUser, FiPhone, FiLock, FiBriefcase, FiMapPin, FiUpload } from 'react-icons/fi';
import { Box } from '@mui/material';

const DashboardContainer = styled(Box)`
 
margin-left: 250px; /* Width of your sidebar */
width: calc(100% - 250px);

@media (max-width: 768px) {
  margin-left: 0;
  width: 100%;
}
`;
const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

const StyledContainer = styled(Container)`
  padding: 2rem 1rem;
  max-width: 800px;
  
  @media (max-width: 768px) {
    padding: 1rem 0.5rem;
  }
`;

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  border: none;
  overflow: hidden;
`;

const CardHeader = styled(Card.Header)`
  background: linear-gradient(135deg, #3f51b5 0%, #2196f3 100%);
  color: white;
  padding: 1.5rem;
  border: none;
`;

const CardTitle = styled.h3`
  font-weight: 600;
  margin: 0;
`;

const CardBody = styled(Card.Body)`
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
`;

const FormGroup = styled(Form.Group)`
  margin-bottom: 1.5rem;
  position: relative;
`;

const FormIcon = styled.div`
  position: absolute;
  left: 15px;
  top: 42px;
  color: #6c757d;
`;

const StyledFormControl = styled(Form.Control)`
  padding-left: 40px;
  height: 50px;
  border-radius: 8px;
  border: 1px solid #ced4da;
  
  &:focus {
    box-shadow: 0 0 0 0.2rem rgba(63, 81, 181, 0.25);
    border-color: #3f51b5;
  }
`;

const StyledFormSelect = styled(Form.Select)`
  padding-left: 40px;
  height: 50px;
  border-radius: 8px;
  border: 1px solid #ced4da;
  
  &:focus {
    box-shadow: 0 0 0 0.2rem rgba(63, 81, 181, 0.25);
    border-color: #3f51b5;
  }
`;

const StyledButton = styled(Button)`
  background: linear-gradient(135deg, #3f51b5 0%, #2196f3 100%);
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const FileInputLabel = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  border: 2px dashed #ced4da;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #3f51b5;
  }
`;

const AvatarPreview = styled.div`
  width: 128px;
  height: 128px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 1rem auto;
  border: 3px solid #3f51b5;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UploadIcon = styled(FiUpload)`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #6c757d;
`;

export const CreateMahasiswa = () => {
  const [username, setUsername] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');

  const [cabangId, setCabangId] = useState('');
 
  const [password, setPassword] = useState('');

  const [file, setFile] = useState("");
  const [cabangs, setCabangs] = useState([]);
  const [preview, setPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseCabang = await axios.get(`${getApiBaseUrl()}/cabang`, { withCredentials: true });
        setCabangs(responseCabang.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const saveMahasiswa = async (e) => {
    e.preventDefault();
    if (!username || !namaLengkap || !cabangId || !password || !file) {
      Swal.fire({
        icon: 'warning',
        title: 'Form tidak lengkap!',
        text: 'Harap isi semua kolom yang wajib diisi.',
        confirmButtonColor: '#3f51b5',
      });
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('nama_lengkap', namaLengkap);
    
      formData.append('CabangId', cabangId);
   
      formData.append('password', password);
   
      formData.append("file", file);

      const response = await axios.post(`${getApiBaseUrl()}/mahasiswa`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }, { withCredentials: true });

      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'mahasiswa berhasil dibuat!',
        confirmButtonColor: '#3f51b5',
      });
      navigate('/datamahasiswa');
      console.log(response.data);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        Swal.fire({
          icon: 'error',
          title: 'Username sudah terdaftar',
          text: 'Username yang dimasukkan sudah digunakan, silakan gunakan username yang berbeda.',
          confirmButtonColor: '#3f51b5',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.',
          confirmButtonColor: '#3f51b5',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadImage = (e) => {
    const image = e.target.files[0];
    setFile(image);
    setPreview(URL.createObjectURL(image));
  };

  return (
    <DashboardContainer>
      <StyledCard>
        <CardHeader>
          <CardTitle>Tambah Mahassiswa Baru</CardTitle>
        </CardHeader>
        <CardBody>
          <Form onSubmit={saveMahasiswa}>
            <Row>
              <Col md={6}>
                <FormGroup className="mb-4">
                  <Form.Label>Username</Form.Label>
                  <FormIcon>
                    <FiUser />
                  </FormIcon>
                  <StyledFormControl
                    type="text"
                    placeholder="Masukkan username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="mb-4">
                  <Form.Label>Nama Lengkap</Form.Label>
                  <FormIcon>
                    <FiUser />
                  </FormIcon>
                  <StyledFormControl
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    required
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              
              <Col md={6}>
                <FormGroup className="mb-4">
                  <Form.Label>Cabang</Form.Label>
                  <FormIcon>
                    <FiMapPin />
                  </FormIcon>
                  <StyledFormSelect
                    value={cabangId}
                    onChange={(e) => setCabangId(e.target.value)}
                    required
                  >
                    <option value="">Pilih Cabang</option>
                    {cabangs.map((cabang) => (
                      <option key={cabang.id} value={cabang.id}>
                        {cabang.nama}
                      </option>
                    ))}
                  </StyledFormSelect>
                </FormGroup>
              </Col>
            </Row>

            <Row>
              
              <Col md={6}>
                <FormGroup className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <FormIcon>
                    <FiLock />
                  </FormIcon>
                  <StyledFormControl
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col>
                <Form.Group>
                  <Form.Label>Profile Picture</Form.Label>
                  <input
                    type="file"
                    id="file"
                    accept="image/*"
                    onChange={loadImage}
                    style={{ display: 'none' }}
                    required
                  />
                  
                  {preview ? (
                    <div className="text-center">
                      <AvatarPreview>
                        <img src={preview} alt="Preview" />
                      </AvatarPreview>
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => document.getElementById('file').click()}
                      >
                        Ganti Foto
                      </Button>
                    </div>
                  ) : (
                    <FileInputLabel htmlFor="file">
                      <UploadIcon />
                      <span>Pilih foto profil mahasiswa</span>
                      <small className="text-muted mt-1">Klik disini untuk upload</small>
                    </FileInputLabel>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <div className="d-grid gap-2">
              <StyledButton type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Memproses...
                  </>
                ) : (
                  'Simpan Data mahasiswa'
                )}
              </StyledButton>
            </div>
          </Form>
        </CardBody>
      </StyledCard>
    </DashboardContainer>
  );
};