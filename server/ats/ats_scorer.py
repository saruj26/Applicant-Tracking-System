"""
ATS (Applicant Tracking System) Scoring Module
Calculates match scores for applicants based on resume content and job requirements
"""

import re
from typing import Dict, List
import docx
import PyPDF2


def extract_text_from_pdf(file) -> str:
    """Extract text from PDF file"""
    try:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return ""


def extract_text_from_docx(file) -> str:
    """Extract text from DOCX file"""
    try:
        document = docx.Document(file)
        text = "\n".join([paragraph.text for paragraph in document.paragraphs])
        return text.strip()
    except Exception as e:
        print(f"Error extracting DOCX text: {e}")
        return ""


def extract_text_from_resume(file) -> str:
    """
    Extract text from resume file (PDF or DOCX)
    
    Args:
        file: Django UploadedFile object
        
    Returns:
        Extracted text as string
    """
    filename = file.name.lower()
    
    if filename.endswith('.pdf'):
        return extract_text_from_pdf(file)
    elif filename.endswith('.docx') or filename.endswith('.doc'):
        return extract_text_from_docx(file)
    else:
        return ""


def extract_keywords(text: str, min_word_length: int = 3) -> List[str]:
    """
    Extract meaningful keywords from text
    
    Args:
        text: Text to extract keywords from
        min_word_length: Minimum length of words to consider
        
    Returns:
        List of extracted keywords
    """
    # Remove special characters and convert to lowercase
    cleaned_text = re.sub(r'[^\w\s]', ' ', text.lower())
    words = cleaned_text.split()
    
    # Common stop words to exclude
    stop_words = {
        'the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'has',
        'was', 'were', 'been', 'are', 'will', 'would', 'could', 'should',
        'can', 'may', 'also', 'into', 'than', 'them', 'these', 'those',
        'there', 'their', 'about', 'when', 'where', 'which', 'who', 'why',
        'how', 'what', 'but', 'not', 'your', 'our', 'you', 'they', 'she',
        'his', 'her', 'him', 'his', 'its'
    }
    
    # Filter meaningful keywords
    keywords = [
        word for word in words 
        if len(word) >= min_word_length and word not in stop_words
    ]
    
    return keywords


def calculate_keyword_match_score(resume_text: str, job_text: str) -> float:
    """
    Calculate keyword match score between resume and job description
    
    Args:
        resume_text: Text from resume
        job_text: Text from job description/requirements
        
    Returns:
        Score from 0-100 based on keyword matching
    """
    if not job_text or not resume_text:
        return 0.0
    
    # Extract keywords from both texts
    job_keywords = set(extract_keywords(job_text))
    resume_keywords = set(extract_keywords(resume_text))
    
    if not job_keywords:
        return 0.0
    
    # Calculate match percentage
    matched_keywords = job_keywords.intersection(resume_keywords)
    match_percentage = (len(matched_keywords) / len(job_keywords)) * 100
    
    return round(match_percentage, 2)


def extract_technical_skills(text: str) -> List[str]:
    """
    Extract technical skills from text
    
    Args:
        text: Text to extract skills from
        
    Returns:
        List of found technical skills
    """
    # Common technical skills database
    technical_skills = {
        # Programming Languages
        'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'php',
        'swift', 'kotlin', 'go', 'rust', 'scala', 'r', 'matlab',
        
        # Web Technologies
        'html', 'css', 'react', 'angular', 'vue', 'node', 'nodejs', 'express',
        'django', 'flask', 'fastapi', 'spring', 'asp.net', 'rails',
        
        # Databases
        'sql', 'mysql', 'postgresql', 'mongodb', 'oracle', 'redis', 'cassandra',
        'dynamodb', 'sqlite', 'mariadb',
        
        # Cloud & DevOps
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github',
        'gitlab', 'terraform', 'ansible', 'ci/cd', 'linux', 'unix',
        
        # Data Science & AI
        'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn',
        'pandas', 'numpy', 'data analysis', 'statistics', 'nlp', 'computer vision',
        
        # Other Technologies
        'rest', 'api', 'graphql', 'microservices', 'agile', 'scrum', 'jira',
        'testing', 'unit testing', 'automation', 'selenium'
    }
    
    text_lower = text.lower()
    found_skills = []
    
    for skill in technical_skills:
        if skill in text_lower:
            found_skills.append(skill)
    
    return found_skills


def calculate_skill_match_score(resume_skills: List[str], job_skills: List[str]) -> float:
    """
    Calculate skill match score
    
    Args:
        resume_skills: Skills found in resume
        job_skills: Skills required in job
        
    Returns:
        Score from 0-100 based on skill matching
    """
    if not job_skills:
        return 0.0
    
    matched_skills = set(resume_skills).intersection(set(job_skills))
    score = (len(matched_skills) / len(job_skills)) * 100
    
    return round(score, 2)


def calculate_ats_score(resume_file, job_description: str, job_requirements: str = "", 
                       cover_letter: str = "") -> Dict:
    """
    Calculate comprehensive ATS score for an applicant
    
    Args:
        resume_file: Django UploadedFile object containing resume
        job_description: Job description text
        job_requirements: Job requirements text
        cover_letter: Applicant's cover letter text
        
    Returns:
        Dictionary containing:
        - overall_score: Final ATS score (0-100)
        - keyword_score: Keyword match score
        - skill_score: Technical skill match score
        - matched_keywords: List of matched keywords
        - matched_skills: List of matched technical skills
        - resume_text: Extracted resume text (for reference)
    """
    # Extract text from resume
    resume_text = extract_text_from_resume(resume_file)
    
    # Combine resume text with cover letter for comprehensive analysis
    full_candidate_text = f"{resume_text}\n{cover_letter}"
    
    # Combine job description and requirements
    full_job_text = f"{job_description}\n{job_requirements}"
    
    # Calculate keyword match score
    keyword_score = calculate_keyword_match_score(full_candidate_text, full_job_text)
    
    # Extract and match technical skills
    resume_skills = extract_technical_skills(full_candidate_text)
    job_skills = extract_technical_skills(full_job_text)
    skill_score = calculate_skill_match_score(resume_skills, job_skills)
    
    # Calculate overall score (weighted average)
    # 60% keyword matching, 40% skill matching
    overall_score = round((keyword_score * 0.6) + (skill_score * 0.4), 2)
    
    # Find matched keywords and skills
    job_keywords = set(extract_keywords(full_job_text))
    resume_keywords = set(extract_keywords(full_candidate_text))
    matched_keywords = list(job_keywords.intersection(resume_keywords))[:20]  # Top 20
    
    matched_skills = list(set(resume_skills).intersection(set(job_skills)))
    
    return {
        'overall_score': min(100, overall_score),  # Cap at 100
        'keyword_score': keyword_score,
        'skill_score': skill_score,
        'matched_keywords': matched_keywords,
        'matched_skills': matched_skills,
        'resume_text': resume_text[:500],  # First 500 chars for reference
        'total_keywords_found': len(resume_keywords),
        'total_skills_found': len(resume_skills)
    }
