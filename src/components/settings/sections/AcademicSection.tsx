import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { updateUserProfile } from "@/api/user.api";
import { useToast } from "@/hooks/use-toast";
import { DepartmentSelect } from "../DepartmentSelect";
import { useQueryClient } from "@tanstack/react-query";

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
}> = ({ label, value, onChange, options, placeholder, disabled }) => (
  <div>
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <div className="mt-2">
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="h-10">
          <SelectValue
            placeholder={placeholder || `Choose ${label.toLowerCase()}`}
          />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
);

const AcademicSection: React.FC = () => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.departmentId) {
        setSelectedDepartmentId(user.departmentId);
      }
      setLevel(String(user.level || ""));
    }
  }, [user]);

  const handleSaveChanges = async () => {
    if (!user || isSaving) return;
    setIsSaving(true);
    try {
      const updatedUser = await updateUserProfile({
        departmentId: selectedDepartmentId,
        level: parseInt(level, 10),
      });
      setUser(updatedUser);
      
      // Invalidate recommendations query to refresh recommendations
      queryClient.invalidateQueries({ queryKey: ["recommendedMaterials"] });
      
      toast({
        title: "Success",
        description: "Academic details updated successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update academic details.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-4 sm:p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Study Information</h3>
      <p className="text-xs text-gray-500 mt-1">
        This helps us recommend the right materials for you
      </p>
      <hr className="my-4 border-gray-200" />
      <div className="grid grid-cols-1 gap-4">
        <Field
          label="University"
          value="University of Ibadan "
          onChange={() => {}}
          options={[
            {
              value: "University of Ibadan",
              label: "University of Ibadan",
            },
          ]}
          disabled
        />
        <DepartmentSelect
          value={selectedDepartmentId}
          onChange={setSelectedDepartmentId}
        />
        <Field
          label="Level"
          value={level}
          onChange={setLevel}
          options={["100", "200", "300", "400", "500"].map((l) => ({
            value: l,
            label: l,
          }))}
          placeholder="Select your level"
        />
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSaveChanges}
          className="px-4 py-2 bg-brand text-white rounded-lg text-sm hover:bg-brand/90 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300 flex items-center gap-2"
          disabled={!selectedDepartmentId || !level || isSaving}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
};

export default AcademicSection;
