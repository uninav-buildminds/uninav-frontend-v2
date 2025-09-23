import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Field: React.FC<{ label: string; value: string; onChange: (v: string)=>void; options: string[] }> = ({ label, value, onChange, options }) => (
  <div>
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <div className="mt-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-10">
          <SelectValue placeholder={`Choose ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map(opt => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
);

const AcademicSection: React.FC = () => {
  const [uni, setUni] = React.useState("University of Ibadan");
  const [faculty, setFaculty] = React.useState("Science");
  const [dept, setDept] = React.useState("Computer Science");
  const [grad, setGrad] = React.useState("2026");

  return (
    <div className="rounded-xl bg-white p-4 sm:p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Study Information</h3>
      <p className="text-xs text-gray-500 mt-1">This helps us recommend the right materials for you</p>
      <hr className="my-4 border-gray-200" />
      <div className="grid grid-cols-1 gap-4">
        <Field label="University" value={uni} onChange={setUni} options={["University of Ibadan","University of Lagos","Obafemi Awolowo University"]} />
        <Field label="Faculty" value={faculty} onChange={setFaculty} options={["Science","Engineering","Arts"]} />
        <Field label="Department" value={dept} onChange={setDept} options={["Computer Science","Mathematics","Physics"]} />
        <Field label="Expected Graduation Year" value={grad} onChange={setGrad} options={["2025","2026","2027","2028"]} />
      </div>
      <div className="mt-6 flex justify-end">
        <button className="px-4 py-2 bg-brand text-white rounded-lg text-sm hover:bg-brand/90">Save Changes</button>
      </div>
    </div>
  );
};

export default AcademicSection;


