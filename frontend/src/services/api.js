import axios from 'axios';
import { API_URL } from '../config';

export const certificateAPI = {
  async issueCertificate(data) {
    const response = await axios.post(`${API_URL}/certificates/issue`, data);
    return response.data;
  },

  async verifyCertificate(certificateId) {
    const response = await axios.get(`${API_URL}/certificates/verify/${certificateId}`);
    return response.data;
  },

  async getCertificate(certificateId) {
    const response = await axios.get(`${API_URL}/certificates/${certificateId}`);
    return response.data;
  }
};