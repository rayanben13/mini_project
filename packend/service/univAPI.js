import axios from "axios";


export const getUniversities = async (name) => {
  try {
    const response = await axios.get(`http://universities.hipolabs.com/search?name=${name}&country=algeria`);
    return response.data.map((item) => item.name);
  } catch (error) {
    console.error("Error fetching universities:", error);
   
  }
};

