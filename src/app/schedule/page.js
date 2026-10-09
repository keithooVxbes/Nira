import AppShell from '@/components/layout/AppShell';
import ScheduleClient from './ScheduleClient';
import { getScheduleClasses } from './actions';

export default async function Schedule() {
  const { data: initialClasses } = await getScheduleClasses();

  return (
    <AppShell>
      <ScheduleClient initialClasses={initialClasses || []} />
    </AppShell>
  );
}
