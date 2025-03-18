import React from "react";
import { useState } from "react";
import { HiOutlinePlusSm, HiOutlineMinusSm } from "react-icons/hi";
import Layout from "../../../components/layout";
import { dummyFaqs } from "../../../constants";

const Support = ({ onSubmit }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Layout onSubmit={onSubmit}>
      <div className="p-8 rounded-[18px] bg-custom-background-white h-auto flex flex-col justify-center items-center max-h-[100] shadow-md">
        <h1 className="text-3xl font-bold text-center text-black mb-10 mt-8">
          Frequently Asked Questions
        </h1>
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dummyFaqs.map((faq, index) => (
              <div
                key={index}
                className={`rounded-lg  transition-all duration-300 ${
                  openIndex === index ? " border-black " : "border-none"
                }`}
              >
                <button
                  className={`w-full flex rounded-lg border shadow-md border-custom-main items-start text-lg font-medium text-left px-4 py-3 transition-all duration-300 ${
                    openIndex === index
                      ? "bg-custom-tab-inactive text-white rounded-none"
                      : "hover:bg-custom-main hover:text-white"
                  }`}
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="flex-1 whitespace-pre-wrap text-start">
                    {faq.question}
                  </span>
                  <span>
                    {openIndex === index ? (
                      <HiOutlineMinusSm size={20} />
                    ) : (
                      <HiOutlinePlusSm size={20} />
                    )}
                  </span>
                </button>
                {openIndex === index && (
                  <div className="p-4 border  border-gray-400 shadow-md bg-white">
                    <p className="text-black">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Support;
