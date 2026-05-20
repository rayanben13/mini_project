'use client';

import FilesSection from '@/components/profile/FilesSection';
import ProfileHeader from '@/components/profile/ProfileHeader';
import StudyList from '@/components/studyList/studyList';
import { useMyFiles } from '@/hooks/useFilesInformations';
import { useFullUserData } from '@/hooks/useUserInformation';
import { BookOpen, Loader2, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import EditProfileModal from './EditProfileModal';

type TabType = 'files' | 'studylists';

export default function UserProfile() {
  const { data, isLoading } = useFullUserData();

  // ✅ Tab State
  const [activeTab, setActiveTab] = useState<TabType>('files');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const user = data?.result?.information;
  const stats = data?.result?.stats;
  const userDetails = user?.user_information;

  // ✅ Memoize data for the modal to prevent unnecessary resets
  const editData = useMemo(
    () => ({
      fullname: user?.fullname,
      img_user: user?.img_user,
      university: userDetails?.university,
      major: userDetails?.major,
      specialization: userDetails?.specialization,
      academic_year: userDetails?.academic_year,
    }),
    [user, userDetails]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#0975e6]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* ===== Profile Header ===== */}
        <ProfileHeader
          user={user}
          stats={stats}
          isOwnProfile={true}
          onEditClick={() => setIsEditModalOpen(true)}
        />

        {/* ===== Tabs & Content ===== */}
        <div className="space-y-8">
          {/* Tab Buttons */}
          <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 px-2 lg:px-0">
            {[
              { id: 'files' as TabType, label: 'Uploaded Files', icon: Upload },
              {
                id: 'studylists' as TabType,
                label: 'Study Lists',
                icon: BookOpen,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 border-b-2 font-bold text-sm tracking-wide transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-[#0975e6] text-[#0975e6]'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'files' && <FilesSection />}

          {activeTab === 'studylists' && <StudyList />}
        </div>
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentData={editData}
        />
      </div>
    </div>
  );
}
