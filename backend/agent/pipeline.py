"""
LangGraph Pipeline for ATS Resume Optimization Agent
"""

from langgraph.graph import StateGraph, END
from .nodes import (
    AgentState,
    resolve_jd_node,
    parse_jd_node,
    parse_resume_node,
    ats_score_node,
    gap_analysis_node,
    optimize_resume_node,
    intent_guard_node,
    generate_cold_email_node,
    modify_latex_node,
    format_latex_node,
    compile_pdf_node,
)


def build_pipeline() -> StateGraph:
    """Construct and compile the LangGraph pipeline."""

    graph = StateGraph(AgentState)

    # Register nodes
    graph.add_node("resolve_jd", resolve_jd_node)
    graph.add_node("parse_jd", parse_jd_node)
    graph.add_node("parse_resume", parse_resume_node)
    graph.add_node("ats_score", ats_score_node)
    graph.add_node("gap_analysis", gap_analysis_node)
    graph.add_node("optimize_resume", optimize_resume_node)
    graph.add_node("intent_guard", intent_guard_node)
    graph.add_node("generate_cold_email", generate_cold_email_node)
    graph.add_node("modify_latex", modify_latex_node)
    graph.add_node("format_latex", format_latex_node)   # ← one-page enforcer
    graph.add_node("compile_pdf", compile_pdf_node)

    # Define edges (sequential pipeline)
    graph.set_entry_point("resolve_jd")
    graph.add_edge("resolve_jd", "parse_jd")
    graph.add_edge("parse_jd", "parse_resume")
    graph.add_edge("parse_resume", "ats_score")
    graph.add_edge("ats_score", "gap_analysis")
    graph.add_edge("gap_analysis", "optimize_resume")
    graph.add_edge("optimize_resume", "intent_guard")
    graph.add_edge("intent_guard", "generate_cold_email")
    graph.add_edge("generate_cold_email", "modify_latex")
    graph.add_edge("modify_latex", "format_latex")       # ← new step
    graph.add_edge("format_latex", "compile_pdf")
    graph.add_edge("compile_pdf", END)

    return graph.compile()


# Singleton pipeline instance
_pipeline = None

def get_pipeline():
    global _pipeline
    if _pipeline is None:
        _pipeline = build_pipeline()
    return _pipeline
