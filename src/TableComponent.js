import axios from "axios";
import { Flex, Table, Tbody, Text, Th, Thead, Tr, Td } from "@chakra-ui/react";
import { IconButton } from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import React, { useEffect, useState } from "react";
import Loader from "react-js-loader";

const TableComponent = ({
  data,
  loading,
  allHeaders,
  handleDelete,
  handleEdit,
  handleRow,
  showDeleteButton = true, // Default to true, can be overridden
  showEditButton = true, // Default to true, can be overridden
}) => {
  return (
    <Table variant="simple" color={"black"}>
      <Thead>
        <Tr my=".8rem" pl="0px" color="gray.400">
          {allHeaders.map((header, index) => (
            <Th key={index} pl="0px" borderColor={"gray.600"} color="gray.400">
              {header}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {loading ? (
          <Tr>
            <Td colSpan={allHeaders.length} textAlign="center">
              <Loader
                type="spinner-circle"
                bgColor={"#3182CE"}
                color={"black"}
                size={50}
              />
            </Td>
          </Tr>
        ) : data.length === 0 ? (
          <Tr>
            <Td colSpan={allHeaders.length} textAlign="center">
              No Data found
            </Td>
          </Tr>
        ) : (
          data.map((rowData, rowIndex) => (
            <Tr pl="0px" key={rowIndex}>
              {rowData.slice(1).map((cellData, cellIndex) => (
                <Td
                  style={{ cursor: "pointer" }}
                  pl="0px"
                  key={cellIndex}
                  onClick={() => {
                    handleRow(rowData[0]);
                  }}
                >
                  {cellData || "-"}
                </Td>
              ))}
              {/* <Td pl="0px">
                <div>
                  <IconButton
                    aria-label="Delete bank"
                    icon={<DeleteIcon />}
                    onClick={() => handleDelete(rowData[0])}
                    style={{ marginRight: 15 }}
                  />

                  <IconButton
                    aria-label="Edit bank"
                    icon={<EditIcon />}
                    onClick={() => handleEdit(rowData[0])}
                  />
                </div>
              </Td> */}
              <Td pl="0px">
                <div>
                  {showDeleteButton && (
                    <IconButton
                      aria-label="Delete bank"
                      icon={<DeleteIcon />}
                      onClick={() => handleDelete(rowData[0])}
                      style={{ marginRight: 15 }}
                    />
                  )}
                  {showEditButton && (
                    <IconButton
                      aria-label="Edit bank"
                      icon={<EditIcon />}
                      onClick={() => handleEdit(rowData[0])}
                    />
                  )}
                </div>
              </Td>
            </Tr>
          ))
        )}
      </Tbody>
    </Table>
  );
};

export default TableComponent;
