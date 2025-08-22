import json

from ..models import Profile, Goal, UserSettings, Reminder, ChatSession, ChatMessage, ChatBiomarkerScore


def get_download_data(profile: Profile):
    user = profile.plwd
    caregiver = profile.caregiver
    goal = Goal.objects.get(user=profile)
    settings = UserSettings.objects.get(user=profile)
    reminders = Reminder.objects.filter(user=profile)
    chat_sessions = ChatSession.objects.filter(user=user).order_by("-date")

    reminder_str_arr = [f"Title: {reminder.title} Start: {reminder.start}T{reminder.startTime} End: {reminder.end}T{reminder.endTime} Days: {reminder.daysOfWeek}"for reminder in reminders]
    chat_str_arr = [get_session_str(session) for session in chat_sessions]

    data_str = f"""{user.first_name} {user.last_name}'s data
    
    Profile details:
    Patient: {user.first_name} {user.last_name}
    
    Primary Caregiver: {caregiver.first_name} {caregiver.last_name}
    
    Current goal:
    Target: {goal.target} Period: {goal.period} Start date: {goal.start_date} Auto Renew: {goal.auto_renew}
    
    User Settings: 
    PatientViewOverall: {settings.patientViewOverall} PatientCanSchedule: {settings.patientCanSchedule}
    
    Reminders:
    {chr(10).join(reminder_str_arr)}
    
    Chat sessions:
    {chr(10).join(chat_str_arr)}"""
    return data_str

def get_session_str(session: ChatSession):
    messages = ChatMessage.objects.filter(session=session).order_by("ts")
    scores = ChatBiomarkerScore.objects.filter(session=session).order_by("ts")
    
    messages_str = [f"{message.role}: {message.content} ({message.ts})" for message in messages]
    scores_str = [f"{score.score_type}: {score.score} ({score.ts})" for score in scores]
    
    data_str = f"""Chat Session on {session.date} until {session.end_ts} ({session.duration} seconds): {session.source}
    
    Notes: {session.notes} Topics: {session.topics} Sentiment: {session.sentiment}
    
    Messages: 
    {chr(10).join(messages_str)}
    
    Scores: 
    {chr(10).join(scores_str)}
    """
    return data_str