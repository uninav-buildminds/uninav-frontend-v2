export interface PanelData {
  announcement: {
    title: string;
    content: string;
  };
  recents: {
    title: string;
    viewAllText: string;
    items: string[];
  };
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}

export const panelData: PanelData = {
  announcement: {
    title: "Announcement",
    content: "New features are now available! Check out the latest updates to enhance your learning experience."
  },
  recents: {
    title: "Recents",
    viewAllText: "View All",
    items: [
      "Upload CSC 201 Note",
      "Download MTH 202",
      "Saved CSC 201 Lecture",
      "Viewed CSC 201 Lecture",
      "Upload CSC 201 Lecture"
    ]
  },
  user: {
    name: "Tee Daniels",
    email: "tee@uninav.edu",
    avatar: "https://i.pravatar.cc/80?img=12"
  }
};

