import React, { useEffect, useState } from "react";
import Loader from "react-js-loader";
import { Flex, Table, Tbody, Text, Th, Thead, Tr, Td } from "@chakra-ui/react";
import { IconButton } from "@chakra-ui/react";
import {
  DeleteIcon,
  EditIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@chakra-ui/icons";

const CollapsableTableComponent = ({
  data,
  loading,
  allHeaders,
  handleDelete,
  handleEdit,
  handleRow,
}) => {
  const [expandedRows, setExpandedRows] = useState([]);

  const toggleRow = (rowIndex) => {
    const currentIndex = expandedRows.indexOf(rowIndex);
    const newExpandedRows = [...expandedRows];
    if (currentIndex === -1) {
      newExpandedRows.push(rowIndex);
    } else {
      newExpandedRows.splice(currentIndex, 1);
    }
    setExpandedRows(newExpandedRows);
  };

  return (
    <Table variant="simple" color={"black"}>
      <Thead>
        <Tr my=".8rem" pl="0px" color="gray.400">
          {allHeaders.map((header, index) => (
            <Th key={index} pl="0px" borderColor={"gray.600"} color="gray.400">
              {header}
            </Th>
          ))}
          <Th pl="0px" borderColor={"gray.600"} color="gray.400"></Th>{" "}
        </Tr>
      </Thead>
      <Tbody>
        {loading ? (
          <Tr>
            <Td colSpan={allHeaders.length + 1} textAlign="center">
              <Loader
                type="spinner-circle"
                bgColor={"#b19552"}
                color={"black"}
                size={50}
              />
            </Td>
          </Tr>
        ) : data.length === 0 ? (
          <Tr>
            <Td colSpan={allHeaders.length + 1} textAlign="center">
              No Data found
            </Td>
          </Tr>
        ) : (
          data.map((rowData, rowIndex) => (
            <>
              <Tr
                pl="0px"
                key={rowIndex}
                onClick={() => toggleRow(rowIndex)}
                style={{ transition: "background-color 0.3s ease" }}
              >
                {rowData.slice(1, -1).map((cellData, cellIndex) => (
                  <Td
                    style={{
                      cursor: "pointer",
                      transition: "padding 0.3s ease",
                    }}
                    pl="0px"
                    key={cellIndex}
                  >
                    {cellData}
                  </Td>
                ))}
                <Td pl="0px">
                  <Flex>
                    <IconButton
                      aria-label="Delete bank"
                      icon={<DeleteIcon />}
                      onClick={() => handleDelete(rowData[0])}
                      style={{ marginRight: 15 }}
                    />

                    <IconButton
                      aria-label="Edit bank"
                      icon={<EditIcon color="#b19552" />}
                      onClick={() => handleEdit(rowData[0])}
                    />
                  </Flex>
                </Td>
                <Td pl="0px">
                  {expandedRows.includes(rowIndex) ? (
                    <ChevronUpIcon />
                  ) : (
                    <ChevronDownIcon />
                  )}
                </Td>
              </Tr>
              {expandedRows.includes(rowIndex) && (
                <Tr>
                  <Td colSpan={allHeaders.length + 1}>
                    {/* Display a table with collapsed data */}
                    <Table borderWidth={0}>
                      <Tbody>
                        <Th pl="0px" borderColor={"gray.600"} color="gray.400">
                          Users
                        </Th>
                        <Th pl="0px" borderColor={"gray.600"} color="gray.400">
                          Aadhar
                        </Th>
                        <Th pl="0px" borderColor={"gray.600"} color="gray.400">
                          Mobile
                        </Th>
                        <Th pl="0px" borderColor={"gray.600"} color="gray.400">
                          Address
                        </Th>
                        {rowData[rowData.length - 1].map(
                          (collapsedRowData, collapsedRowIndex) => (
                            <Tr key={collapsedRowIndex}>
                              <Td
                                pl="0px"
                                borderColor={"white"}
                                key={collapsedRowIndex}
                                style={{ transition: "padding 0.3s ease" }}
                              >
                                {collapsedRowData.email || "-"}
                              </Td>
                              <Td
                                pl="0px"
                                borderColor={"white"}
                                key={collapsedRowIndex}
                                style={{ transition: "padding 0.3s ease" }}
                              >
                                {collapsedRowData.adhar || "-"}
                              </Td>
                              <Td
                                pl="0px"
                                borderColor={"white"}
                                key={collapsedRowIndex}
                                style={{ transition: "padding 0.3s ease" }}
                              >
                                {collapsedRowData.mobile || "-"}
                              </Td>
                              <Td
                                pl="0px"
                                borderColor={"white"}
                                key={collapsedRowIndex}
                                style={{ transition: "padding 0.3s ease" }}
                              >
                                {collapsedRowData.adress || "-"}
                              </Td>
                            </Tr>
                          )
                        )}
                      </Tbody>
                    </Table>
                  </Td>
                </Tr>
              )}
            </>
          ))
        )}
      </Tbody>
    </Table>
  );
};

export default CollapsableTableComponent;
