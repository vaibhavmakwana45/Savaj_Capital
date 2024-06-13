import {
  Flex,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  useColorModeValue,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Country, State, City } from "country-state-city";
import { useHistory } from "react-router-dom";
import AxiosInstance from "config/AxiosInstance";

function AddSavajCapitalBranch() {
  const textColor = useColorModeValue("gray.700", "white");
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [loading, setLoading] = useState(false);

  const history = useHistory();
  useEffect(() => {
    const statesOfIndia = State.getStatesOfCountry("IN");
    setStates(statesOfIndia);
  }, []);

  useEffect(() => {
    if (selectedState) {
      const citiesOfState = City.getCitiesOfState("IN", selectedState);
      setCities(citiesOfState);
    }
  }, [selectedState]);

  const handleStateChange = (event) => {
    const stateCode = event.target.value;
    const stateObj = states.find((state) => state.isoCode === stateCode);
    const stateFullName = stateObj ? stateObj.name : "";

    setSelectedState(stateCode);
    setFormData((prevFormData) => ({
      ...prevFormData,
      state: stateFullName,
      state_code: stateObj.isoCode,
    }));
  };

  const [formData, setFormData] = useState({
    savajcapitalbranch_id: "",
    savajcapitaluser_id: "",
    branch_name: "",
    state: "",
    city: "",
    state_code: "",
    mobile: "",
    email: "",
    adress: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await AxiosInstance.post("/branch", formData);

      if (response.data.success) {
        toast.success("Branch and User added successfully!");
        history.push("/superadmin/savajcapitalbranch");
      } else {
        toast.error(response.data.message || "Please try again later!");
      }
    } catch (error) {
      console.error("Submission error", error);
      toast.error("Failed to add. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile" && /^\d{0,10}$/.test(value)) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }}>
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" color={textColor} fontWeight="bold">
                Add Savaj Capital Branch
              </Text>
            </Flex>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <FormControl id="state" mt={4} isRequired>
                <FormLabel>State</FormLabel>
                <Select
                  name="state"
                  placeholder="Select state"
                  onChange={handleStateChange}
                >
                  {states.map((state) => (
                    <option key={state.isoCode} value={state.isoCode}>
                      {state.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl id="city" mt={4} isRequired>
                <FormLabel>City</FormLabel>
                <Select
                  name="city"
                  placeholder="Select city"
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                >
                  {cities.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl id="branch_name" isRequired mt={4}>
                <FormLabel>Savaj Capital Branch Name</FormLabel>
                <Input name="branch_name" onChange={handleChange} />
              </FormControl>
              <FormControl id="mobile" mt={4} isRequired>
                <FormLabel>Branch Mobile</FormLabel>
                <Input
                  name="mobile"
                  type="number"
                  value={formData.mobile}
                  onChange={handlePhoneChange}
                  placeholder="Enter your Number"
                />
              </FormControl>
              <FormControl id="email" isRequired mt={4}>
                <FormLabel>Branch Email</FormLabel>
                <Input name="email" onChange={handleChange} />
              </FormControl>{" "}
              <FormControl id="adress" isRequired mt={4}>
                <FormLabel>Branch Address</FormLabel>
                <Input name="adress" onChange={handleChange} />
              </FormControl>
              <div className="d-flex">
                <Button
                  mt={4}
                  colorScheme="blue"
                  type="submit"
                  isLoading={loading}
                  loadingText="Add...."
                  style={{
                    backgroundColor: "#b19552",
                    color: "#fff",
                    marginTop: 30,
                  }}
                >
                  Add Branch
                </Button>

                <Button
                  mt={4}
                  style={{
                    backgroundColor: "#414650",
                    color: "#fff",
                    marginTop: 30,
                    marginLeft: 8,
                  }}
                  onClick={() => history.push("/superadmin/savajcapitalbranch")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </Flex>
      <Toaster />
    </>
  );
}

export default AddSavajCapitalBranch;
