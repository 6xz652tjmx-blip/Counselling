import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

export const getCounselors = (params = {}) =>
  api.get("/counselors", { params }).then((r) => r.data);
export const getCounselor = (id) =>
  api.get(`/counselors/${id}`).then((r) => r.data);
export const createBooking = (payload) =>
  api.post("/bookings", payload).then((r) => r.data);
export const getStories = () =>
  api.get("/stories", { params: { status: "approved" } }).then((r) => r.data);
export const submitStory = (payload) =>
  api.post("/stories", payload).then((r) => r.data);
export const likeStory = (id) =>
  api.post(`/stories/${id}/like`).then((r) => r.data);
export const getResources = () =>
  api.get("/resources").then((r) => r.data);
export const submitContact = (payload) =>
  api.post("/contact", payload).then((r) => r.data);
export const sendChat = (payload) =>
  api.post("/chat", payload).then((r) => r.data);
