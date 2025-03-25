import { useState } from "react";
import { Dropdown } from "flowbite-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PassportDropdown() {
  const { theme } = useSelector((state) => state.theme);
  const [isRequirementsOpen, setRequirementsOpen] = useState(false);
  const [isAdultOpen, setAdultOpen] = useState(false);
  const [isMinorOpen, setMinorOpen] = useState(false);

  return (
    <div className="relative inline-block ">
      <Dropdown
        label="Passport Services"
        inline
        className={`${
          theme === "dark"
            ? "bg-gray-800 text-white border-gray-700"
            : "bg-white text-black border-gray-300 hover:text-blue-500"
        }`}
      >
        <Link to="/general-info">
          <Dropdown.Item
            className={`${
              theme === "dark" ? "hover:bg-gray-600" : "hover:bg-gray-100"
            }`}
          >
            General Information
          </Dropdown.Item>
        </Link>

        <a
          href="https://www.passport.gov.ph/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Dropdown.Item
            className={`${
              theme === "dark" ? "hover:bg-gray-600" : "hover:bg-gray-100"
            }`}
          >
            Book Appointments
          </Dropdown.Item>
        </a>

        <div
          onMouseEnter={() => setRequirementsOpen(true)}
          onMouseLeave={() => setRequirementsOpen(false)}
          className="relative"
        >
         <Dropdown.Item
  className={`cursor-pointer ${
    theme === "dark" ? "text-white hover:bg-gray-600" : "text-black hover:bg-gray-100"
  }`}
>
  Requirements ▸
</Dropdown.Item>

          {isRequirementsOpen && (
            <div
              className={`absolute left-full top-0 border rounded shadow-lg w-48 ${
                theme === "dark"
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-white text-black border-gray-300"
              }`}
            >
              <div
                onMouseEnter={() => setAdultOpen(true)}
                onMouseLeave={() => setAdultOpen(false)}
                className="relative"
              >
                <div
                  className={`px-4 py-2 cursor-pointer ${
                    theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  }`}
                >
                  Adult ▸
                </div>
                {isAdultOpen && (
                  <div
                    className={`absolute left-full top-0 border rounded shadow-lg w-48 ${
                      theme === "dark"
                        ? "bg-gray-800 text-white border-gray-700"
                        : "bg-white text-black border-gray-300"
                    }`}
                  >
                    <Link to="/adult/new">
                      <div
                        className={`px-4 py-2 ${
                          theme === "dark"
                            ? "hover:bg-gray-700"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        New
                      </div>
                    </Link>
                    <Link to="/adult/renewal">
                      <div
                        className={`px-4 py-2 ${
                          theme === "dark"
                            ? "hover:bg-gray-700"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        Renewal Passport
                      </div>
                    </Link>
                    <Link to="/adult/renewal-non-e">
                      <div
                        className={`px-4 py-2 ${
                          theme === "dark"
                            ? "hover:bg-gray-700"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        Renewal Non-ePassport
                      </div>
                    </Link>
                    <Link to="/adult/lost">
                      <div
                        className={`px-4 py-2 ${
                          theme === "dark"
                            ? "hover:bg-gray-700"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        Lost Passport & Travel
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              <div
                onMouseEnter={() => setMinorOpen(true)}
                onMouseLeave={() => setMinorOpen(false)}
                className="relative"
              >
                <div
                  className={`px-4 py-2 cursor-pointer ${
                    theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  }`}
                >
                  Minor ▸
                </div>
                {isMinorOpen && (
                  <div
                    className={`absolute left-full top-0 border rounded shadow-lg w-48 ${
                      theme === "dark"
                        ? "bg-gray-800 text-white border-gray-700"
                        : "bg-white text-black border-gray-300"
                    }`}
                  >
                    <Link to="/minor/new">
                      <div
                        className={`px-4 py-2 ${
                          theme === "dark"
                            ? "hover:bg-gray-700"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        New
                      </div>
                    </Link>
                    <Link to="/minor/renewal">
                      <div
                        className={`px-4 py-2 ${
                          theme === "dark"
                            ? "hover:bg-gray-700"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        Renewal Passport
                      </div>
                    </Link>

                    <Link to="/minor/renewal">
                      <div
                        className={`px-4 py-2 ${
                          theme === "dark"
                            ? "hover:bg-gray-700"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        Renewal Non-ePassport
                      </div>
                    </Link>

                    <Link to="/minor/renewal">
                      <div
                        className={`px-4 py-2 ${
                          theme === "dark"
                            ? "hover:bg-gray-700"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        Lost Passport & Travel
                      </div>
                    </Link>

                  </div>
                )}
              </div>

              <Link to="/requirements/id">
                <div
                  className={`px-4 py-2 ${
                    theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  }`}
                >
                  Valid ID for Passport
                </div>
              </Link>
              <Link to="/requirements/certification">
                <div
                  className={`px-4 py-2 ${
                    theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  }`}
                >
                  Certification
                </div>
              </Link>
              <Link to="/requirements/releasing">
                <div
                  className={`px-4 py-2 ${
                    theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  }`}
                >
                  Releasing
                </div>
              </Link>
            </div>
          )}
        </div>

        <Link to="/courtesy">
          <Dropdown.Item
            className={`${
              theme === "dark" ? "hover:bg-gray-600" : "hover:bg-gray-100"
            }`}
          >
            Courtesy Lane Eligibility
          </Dropdown.Item>
        </Link>

      </Dropdown>
    </div>
  );
}
