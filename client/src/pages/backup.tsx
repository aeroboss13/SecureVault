import BackupRestore from "@/components/backup-restore";

export default function Backup() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Backup & Restore</h1>
          <p className="text-muted-foreground">
            Export and import your password data for backup purposes
          </p>
        </div>
      </div>
      
      <BackupRestore />
    </div>
  );
}