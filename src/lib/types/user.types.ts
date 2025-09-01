
export type UserProfile = {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	username: string;
	departmentId?: string;
	level: number;
	role: "student" | "moderator" | "admin";
	createdAt: string;
	updatedAt: string;
	department?: {
		id: string;
		name: string;
		description: string;
		facultyId: string;
	};
	auth: {
		userId: string;
		email: string;
		verificationCode: string | null;
		emailVerified: boolean;
		matricNo: string | null;
		userIdType: string | null;
		userIdImage: string | null;
		userIdVerified: boolean;
	};
	courses: {
		userId: string;
		courseId: string;
		course: Course;
	}[];
};

export interface Course {
	id: string;
	courseName: string;
	courseCode: string;
	description: string;
	reviewStatus: ApprovalStatusEnum;
	createdAt: string;
	departments?: {
		departmentId: string;
		level: number;
		courseId: string;
		reviewStatus: ApprovalStatusEnum;
		reviewedById: string | null;
		department: Department;
	}[];
}

export interface Department {
	id: string;
	name: string;
	description: string;
	facultyId: string;
	faculty?: Faculty;
}

export interface Faculty {
	id: string;
	name: string;
	description: string;
	departments?: Department[];
}

enum ApprovalStatusEnum {
	APPROVED = "approved",
	PENDING = "pending",
	REJECTED = "rejected",
}
