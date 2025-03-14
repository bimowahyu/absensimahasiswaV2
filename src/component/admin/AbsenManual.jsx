import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Spinner, InputGroup } from 'react-bootstrap';
import styled from 'styled-components';
import { FiUser, FiClock, FiCalendar, FiSearch } from 'react-icons/fi';
import { FaRegClock } from 'react-icons/fa';

const DashboardContainer = styled(Container)`
  margin-left: 250px;
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



const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  border: none;
  overflow: hidden;
  margin-top: 2rem;
`;

const CardHeader = styled(Card.Header)`
  background: linear-gradient(135deg, #3f51b5 0%, #2196f3 100%);
  color: white;
  padding: 1.5rem;
  border: none;
  text-align: center;
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
  padding: 12px 30px;
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

const MessageAlert = styled.div`
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 1.5rem;
  font-weight: 500;
  
  &.success {
    background-color: rgba(76, 175, 80, 0.15);
    color: #2e7d32;
    border: 1px solid rgba(76, 175, 80, 0.3);
  }
  
  &.error {
    background-color: rgba(244, 67, 54, 0.15);
    color: #d32f2f;
    border: 1px solid rgba(244, 67, 54, 0.3);
  }
`;

const NoResultsMessage = styled.div`
  padding: 12px;
  text-align: center;
  color: #6c757d;
  font-style: italic;
`;

export const AbsenManual = () => {
  const [tgl_absensi, setTanggalAbsensi] = useState('');
  const [jam_masuk, setJamMasuk] = useState('');
  const [jam_keluar, setJamKeluar] = useState('');
  const [karyawans, setKaryawans] = useState([]);
  const [karyawanId, setKaryawan] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${getApiBaseUrl()}/karyawan`);
        setKaryawans(Array.isArray(response.data.karyawan) ? response.data.karyawan : []);
      } catch (error) {
        setError('Gagal mengambil data karyawan.');
      }
    };
    fetchData();
  }, []);

  const saveAbsen = async (e) => {
    e.preventDefault();
    
    if (!karyawanId || !jam_masuk || !jam_keluar || !tgl_absensi) {
      setError('Mohon lengkapi semua data absensi.');
      return;
    }
    
    setIsLoading(true);
    try {
      await axios.post(`${getApiBaseUrl()}/absensi/manual`, {
        karyawanId,
        jam_masuk,
        jam_keluar,
        tanggal: tgl_absensi,
      });
      setMessage('Absensi berhasil dibuat');
      setTimeout(() => {
        navigate('/data');
      }, 1500);
    } catch (error) {
      setError(error.response ? error.response.data.msg : 'Gagal menambah absensi.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredKaryawans = karyawans.filter(karyawan => 
    karyawan.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardContainer>
      <StyledCard>
        <CardHeader>
          <CardTitle>Tambah Absensi Manual</CardTitle>
        </CardHeader>
        <CardBody>
          {message && <MessageAlert className="success">{message}</MessageAlert>}
          {error && <MessageAlert className="error">{error}</MessageAlert>}
          
          <Form onSubmit={saveAbsen}>
            <FormGroup className="mb-4">
              <Form.Label>Cari Karyawan</Form.Label>
              <FormIcon>
                <FiSearch />
              </FormIcon>
              <StyledFormControl
                type="text"
                placeholder="Masukkan nama karyawan"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </FormGroup>

            <FormGroup className="mb-4">
              <Form.Label>Pilih Karyawan</Form.Label>
              <FormIcon>
                <FiUser />
              </FormIcon>
              <StyledFormSelect
                value={karyawanId}
                onChange={(e) => setKaryawan(e.target.value)}
                required
              >
                <option value="">Pilih Karyawan</option>
                {filteredKaryawans.length > 0 ? (
                  filteredKaryawans.map((karyawan) => (
                    <option key={karyawan.id} value={karyawan.id}>
                      {`${karyawan.nama_lengkap} - ${karyawan.Cabang ? karyawan.Cabang.nama_cabang : 'Cabang Tidak Tersedia'}`}
                    </option>
                  ))
                ) : (
                  searchTerm ? <option disabled>Tidak ada karyawan yang sesuai</option> : null
                )}
              </StyledFormSelect>
            </FormGroup>

            <Row>
              <Col md={6}>
                <FormGroup className="mb-4">
                  <Form.Label>Jam Masuk</Form.Label>
                  <FormIcon>
                    <FiClock />
                  </FormIcon>
                  <StyledFormControl
                    type="time"
                    value={jam_masuk}
                    onChange={(e) => setJamMasuk(e.target.value)}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="mb-4">
                  <Form.Label>Jam Keluar</Form.Label>
                  <FormIcon>
                    <FaRegClock />
                  </FormIcon>
                  <StyledFormControl
                    type="time"
                    value={jam_keluar}
                    onChange={(e) => setJamKeluar(e.target.value)}
                    required
                  />
                </FormGroup>
              </Col>
            </Row>

            <FormGroup className="mb-4">
              <Form.Label>Tanggal Absensi</Form.Label>
              <FormIcon>
                <FiCalendar />
              </FormIcon>
              <StyledFormControl
                type="date"
                value={tgl_absensi}
                onChange={(e) => setTanggalAbsensi(e.target.value)}
                required
              />
            </FormGroup>

            <div className="d-flex justify-content-center mt-4">
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
                  'Tambah Absensi'
                )}
              </StyledButton>
            </div>
          </Form>
        </CardBody>
      </StyledCard>
    </DashboardContainer>
  );
};

export default AbsenManual;