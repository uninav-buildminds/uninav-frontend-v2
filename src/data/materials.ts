export interface Material {
  id: string;
  name: string;
  uploadTime: string;
  downloads: number;
  previewImage: string;
  pages?: number;
}

export const recentMaterials: Material[] = [
  {
    id: "1",
    name: "MTH 202 Quiz Solutions",
    uploadTime: "1 hour ago",
    downloads: 8,
    previewImage: "/placeholder.svg",
    pages: 12
  },
  {
    id: "2",
    name: "CSC 204 Reading Materials",
    uploadTime: "1 day ago",
    downloads: 15,
    previewImage: "/placeholder.svg",
    pages: 46
  },
  {
    id: "3",
    name: "CSC 205 Exam Past Questions",
    uploadTime: "3 hours ago",
    downloads: 10,
    previewImage: "/placeholder.svg",
    pages: 27
  },
  {
    id: "4",
    name: "CSC 203 Project Proposal",
    uploadTime: "30 minutes ago",
    downloads: 5,
    previewImage: "/placeholder.svg",
    pages: 9
  },
  {
    id: "5",
    name: "CSC 201 Lecture Notes",
    uploadTime: "2 hours ago",
    downloads: 12,
    previewImage: "/placeholder.svg",
    pages: 32
  }
];

export const recommendations: Material[] = [
  {
    id: "6",
    name: "ENG 101 Essay Writing Guide",
    uploadTime: "2 days ago",
    downloads: 23,
    previewImage: "/placeholder.svg",
    pages: 18
  },
  {
    id: "7",
    name: "PHY 101 Lab Manual",
    uploadTime: "4 hours ago",
    downloads: 18,
    previewImage: "/placeholder.svg",
    pages: 24
  },
  {
    id: "8",
    name: "BIO 101 Study Notes",
    uploadTime: "1 day ago",
    downloads: 31,
    previewImage: "/placeholder.svg",
    pages: 40
  },
  {
    id: "9",
    name: "CHE 101 Formula Sheet",
    uploadTime: "6 hours ago",
    downloads: 27,
    previewImage: "/placeholder.svg",
    pages: 6
  },
  {
    id: "10",
    name: "ECO 101 Case Studies",
    uploadTime: "3 days ago",
    downloads: 19,
    previewImage: "/placeholder.svg",
    pages: 22
  }
];
