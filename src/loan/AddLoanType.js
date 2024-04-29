import {
  Flex,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  Switch,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React, { useEffect, useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Country, State, City } from "country-state-city";
import axios from "axios";
import { useHistory, useLocation } from "react-router-dom";
import AxiosInstance from "config/AxiosInstance";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

function AddLoanType() {
  const location = useLocation();
  const textColor = useColorModeValue("gray.700", "white");
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [selectedState, setSelectedState] = useState("");
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  const [isSubtype, setIsSubtype] = useState(false);

  const handleSwitchChange = () => {
    setIsSubtype(!isSubtype);
  };

  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");

  const subtypeRefs = useRef([]);

  const allBanksName = [
    "State Bank of India (SBI)",
    "HDFC Bank",
    "ICICI Bank",
    "Punjab National Bank (PNB)",
    "Axis Bank",
    "Canara Bank",
    "Bank of Baroda (BoB)",
    "Union Bank of India",
    "Bank of India (BoI)",
    "IndusInd Bank",
    "IDBI Bank",
    "Kotak Mahindra Bank",
    "Central Bank of India",
    "Yes Bank",
    "Indian Bank",
    "Federal Bank",
    "UCO Bank",
    "Syndicate Bank",
    "Bank of Maharashtra",
    "South Indian Bank",
    "Karur Vysya Bank",
    "Punjab & Sind Bank",
    "Dena Bank",
    "Vijaya Bank",
    "Andhra Bank",
    "IDFC FIRST Bank",
    "RBL Bank",
    "HSBC India",
    "Standard Chartered Bank India",
    "Citibank India",
  ];

  const [formData, setFormData] = useState({
    loan_type: "",
    loan_subtype: [""],
  });

  const getData = async () => {
    try {
      const response = await AxiosInstance.get("/addusers/bankuser/" + id);

      if (response.data.success) {
        const { bankDetails, userDetails } = response.data;

        const submissionData = {
          bank_id: id,
          user_id: "",
          bank_name: bankDetails.bank_name,
          country: bankDetails.country,
          state: bankDetails.state,
          city: bankDetails.city,
          branch_name: bankDetails.branch_name,
          email: userDetails.email,
          password: "",
          country_code: bankDetails.country_code,
          state_code: bankDetails.state_code,
        };

        setSelectedState(bankDetails.state_code);
        setSelectedCountry(bankDetails.country_code);
        setFormData(submissionData);
      } else {
        alert("Please try again later...!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (id) {
      getData();
    }
    setCountries(Country.getAllCountries());
    setStates(State.getStatesOfCountry("IN"));
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const statesOfSelectedCountry = State.getStatesOfCountry(selectedCountry);
      setStates(statesOfSelectedCountry);
      setSelectedState(""); // Reset selected state when country changes
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState) {
      const citiesOfState = City.getCitiesOfState(
        selectedCountry,
        selectedState
      );
      setCities(citiesOfState);
    } else {
      setCities([]);
    }
  }, [selectedState, selectedCountry]);

  const handleStateChange = (event) => {
    const stateCode = event.target.value;
    const stateObj = states.find((state) => state.isoCode === stateCode);
    const stateFullName = stateObj ? stateObj.name : "";

    setSelectedState(stateCode);
    setFormData((prevFormData) => ({
      ...prevFormData,
      state: stateFullName,
    }));
  };

  const handleCountryChange = (event) => {
    setSelectedCountry(event.target.value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleChangeSubtype = (e, index) => {
    const { name, value } = e.target;
    const subtypes = [...formData.loan_subtype];
    subtypes[index] = value;
    setFormData({
      ...formData,
      loan_subtype: subtypes,
    });
  };

  const handleAddSubtype = () => {
    setFormData({
      ...formData,
      loan_subtype: [...formData.loan_subtype, ""],
    });
  };

  const handleRemoveSubtype = (index) => {
    const subtypes = [...formData.loan_subtype];
    subtypes.splice(index, 1);

    console.log("subtype.splice", subtypes.splice(index, 1));
    setFormData({
      ...formData,
      loan_subtype: subtypes,
    });
  };

  useEffect(() => {
    const secondLastSubtype =
      formData.loan_subtype[formData.loan_subtype.length - 2];
    const lastSubtype = formData.loan_subtype[formData.loan_subtype.length - 1];
    if (secondLastSubtype !== "" && lastSubtype !== "") {
      handleAddSubtype();
    } else if (
      secondLastSubtype === "" &&
      lastSubtype === "" &&
      formData.loan_subtype.length > 1
    ) {
      handleRemoveSubtype(formData.loan_subtype.length - 1);
    }
  }, [formData.loan_subtype]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        loan: formData.loan_type,
        is_subtype: isSubtype,
        loan_type: formData.loan_subtype.slice(
          0,
          formData.loan_subtype.length - 1
        ),
        loan_step_id: selectedLoanStepIds, 
      };

      if (
        isSubtype &&
        formData.loan_subtype.slice(0, formData.loan_subtype.length - 1)
          .length == 0
      ) {
        toast.error("please add subtypes");
        return;
      }

      const response = await AxiosInstance.post(`/loan/`, data);
      if (response.data.success) {
        const msg = "Loan Added Successfully!";
        toast.success(msg);
        history.push("/superadmin/loan");
      } else {
        toast.error("Please try again later!");
      }
    } catch (error) {
      console.error("Submission error", error);
      toast.error("Failed to add. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ======================== Loan Steps =================================================

  const [loanSteps, setLoanSteps] = useState([]);
  const [selectedLoanStepIds, setSelectedLoanStepIds] = useState([]);

  const getLoanStepsData = async () => {
    try {
      const response = await AxiosInstance.get("/loan_step");

      if (response.data.success) {
        setLoanSteps(response.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getLoanStepsData();
  }, []);

  // Function to handle switch toggle
  const handleSwitchToggle = (event, stepId) => {
    const updatedSelectedLoanStepIds = [...selectedLoanStepIds];
    const index = updatedSelectedLoanStepIds.indexOf(stepId);

    if (event.target.checked && index === -1) {
      updatedSelectedLoanStepIds.push(stepId);
    } else if (!event.target.checked && index !== -1) {
      updatedSelectedLoanStepIds.splice(index, 1);
    }

    setSelectedLoanStepIds(updatedSelectedLoanStepIds);
  };

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }}>
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" color={textColor} fontWeight="bold">
                Add Loans
              </Text>
            </Flex>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <FormControl id="loan_type" mt={4} isRequired>
                <FormLabel>Loan</FormLabel>
                <Input
                  name="loan_type"
                  onChange={handleChange}
                  value={formData.loan_type}
                />
              </FormControl>
              <div className="card" style={{padding:"30px",borderRadius:"15px",marginTop:"30px",boxShadow: "rgba(9, 30, 66, 0.25) 0px 4px 8px -2px, rgba(9, 30, 66, 0.08) 0px 0px 0px 1px"}}>
                <div className="d-flex flex-wrap">
                  {loanSteps.map((step) => (
                    <FormControl
                      key={step._id}
                      alignItems="center"
                      mt="5"
                      style={{ width: "25%" }}
                    >
                      <Switch
                        id={`email-alerts-${step.loan_step_id}`}
                        isChecked={selectedLoanStepIds.includes(
                          step.loan_step_id
                        )}
                        onChange={(event) =>
                          handleSwitchToggle(event, step.loan_step_id)
                        }
                        style={{boxShadow: "rgba(0, 0, 0, 0.07) 0px 1px 1px, rgba(0, 0, 0, 0.07) 0px 2px 2px, rgba(0, 0, 0, 0.07) 0px 4px 4px, rgba(0, 0, 0, 0.07) 0px 8px 8px, rgba(0, 0, 0, 0.07) 0px 16px 16px",borderRadius:"30px",marginBottom:"10px"}}
                      />
                      <FormLabel
                        htmlFor={`email-alerts-${step.loan_step_id}`}
                        mb="0"
                        style={{fontSize:"14px",fontWeight:600}}
                      >
                        <i>{step.loan_step}</i>
                      </FormLabel>
                    </FormControl>
                  ))}
                </div>
              </div>

              <FormControl display="flex" alignItems="center" mt="5">
                <FormLabel htmlFor="email-alerts" mb="0">
                  Do you have sub types of this Loan?
                </FormLabel>
                <Switch
                  id="email-alerts"
                  onChange={handleSwitchChange}
                  isChecked={isSubtype}
                />
              </FormControl>

              {isSubtype &&
                formData.loan_subtype.map((subtype, index) => (
                  <FormControl key={index} id={`loan_subtype_${index}`} mt={8}>
                    <FormLabel>{`Loan Type ${index + 1}`}</FormLabel>
                    <Flex alignItems="center">
                      <Input
                        name={`loan_subtype_${index}`}
                        onChange={(e) => handleChangeSubtype(e, index)}
                        value={subtype}
                        ref={(inputRef) =>
                          (subtypeRefs.current[index] = inputRef)
                        }
                        mr={2} 
                      />
                      <Button
                        type="button"
                        onClick={() => handleRemoveSubtype(index)}
                        colorScheme="red"
                      >
                        Remove
                      </Button>
                    </Flex>
                  </FormControl>
                ))}

              <div>
                <Button
                  mt={4}
                  colorScheme="teal"
                  type="submit"
                  isLoading={loading}
                  loadingText="Submitting"
                  style={{ marginTop: 40 }}
                >
                  Submit
                </Button>
                <Button
                  mt={4}
                  colorScheme="yellow"
                  style={{ marginTop: 40, marginLeft: 8 }}
                  onClick={() => history.push("/superadmin/loan")}
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

export default AddLoanType;
