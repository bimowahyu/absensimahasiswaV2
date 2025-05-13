import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import styled from 'styled-components';
const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
 const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

const fetcher = (url) => axios.get(url).then(res => res.data);

const TableContainer = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 20px;
  overflow-x: auto; 
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 600px; 
`;

const TableHeader = styled.th`
  background-color: #f8f9fa;
  color: #495057;
  font-weight: 600;
  padding: 12px;
  text-align: left;
  border-bottom: 2px solid #dee2e6;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f8f9fa;
  }
  &:hover {
    background-color: #e9ecef;
  }
`;

const TableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  margin-bottom: 20px;
  &:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
  }
`;

const AbsensiDetail = () => {
  const now = new Date();
  const bulan = now.getMonth() + 1; 
  const tahun = now.getFullYear();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, error } = useSWR(`${getApiBaseUrl()}/absensibulanini/get?bulan=${bulan}&tahun=${tahun}`, fetcher, {
    refreshInterval: 3000 
  });

  if (error) return <div>Silahkan refresh</div>;
  if (!data) return <div>Loading...</div>;

  const formattedData = [];

  data.forEach((mahasiswaData, mahasiswaIndex) => {
    mahasiswaData.absensi.forEach((absensi, absensiIndex) => {
      const tanggal = absensi.tanggal ? new Date(absensi.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
      formattedData.push({
        id: `${mahasiswaIndex + 1}-${absensiIndex + 1}`,
        mahasiswa: mahasiswaData.nama || '',
        // tanggal: absensi.tanggal || '',
        tanggal: tanggal,
        jam_masuk: absensi.jam_masuk || '',
        jam_keluar: absensi.jam_keluar || '',
        cabang: mahasiswaData.cabang || 'N/A' 
      });
    });
  });

  const filteredData = formattedData.filter(absensi => 
    (absensi.mahasiswa && absensi.mahasiswa.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (absensi.tanggal && absensi.tanggal.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (absensi.cabang && absensi.cabang.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <SearchInput 
        type="text" 
        placeholder="Cari Mahasiswa, tanggal, atau cabang..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <TableContainer>
        <StyledTable>
          <thead>
            <tr>
              <TableHeader>No</TableHeader>
              <TableHeader>Mahasiswa</TableHeader>
              <TableHeader>Tanggal</TableHeader>
              <TableHeader>Jam Masuk</TableHeader>
              <TableHeader>Jam Keluar</TableHeader>
              <TableHeader>Cabang</TableHeader>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((absensi, index) => (
              <TableRow key={absensi.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{absensi.mahasiswa}</TableCell>
                <TableCell>{absensi.tanggal}</TableCell>
                <TableCell>{absensi.jam_masuk ? absensi.jam_masuk : "Tidak Presensi"}</TableCell>
                <TableCell>{absensi.jam_keluar ? absensi.jam_keluar : "Belum absen keluar"}</TableCell>
                <TableCell>{absensi.cabang}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </StyledTable>
      </TableContainer>
    </div>
  );
};

export default AbsensiDetail;