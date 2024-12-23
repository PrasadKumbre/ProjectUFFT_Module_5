from flask import Flask, render_template, jsonify, Response, send_file, request
from flask_sqlalchemy import SQLAlchemy
import pandas as pd
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

app = Flask(__name__)

# MySQL Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:root@localhost:3306/ProjectUFFT'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class Expense(db.Model):
    __tablename__ = 'expenses'
    expense_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.category_id'))
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.String(255))
    category = db.relationship("Category", backref="expenses")

class Category(db.Model):
    __tablename__ = 'categories'
    category_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

class Report(db.Model):
    __tablename__ = 'reports'
    report_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, nullable=False)
    content = db.Column(db.Text, nullable=False)
    generated_at = db.Column(db.DateTime, nullable=False)


# Route to fetch user-specific data
@app.route('/', methods=['GET', 'POST'])
def index():
    # Fetch all unique user IDs
    user_ids = [row[0] for row in db.session.query(Expense.user_id).distinct().all()]

    selected_user_id = None
    search_query = None
    expense_data = []
    category_totals = {}

    if request.method == 'POST':
        # Get user_id and search_query from the form
        selected_user_id = request.form.get('user_id')
        search_query = request.form.get('search_query', '').strip()

        try:
            selected_user_id = int(selected_user_id)
        except ValueError:
            selected_user_id = None

        if selected_user_id:
            query = db.session.query(Expense, Category.name).join(Category).filter(Expense.user_id == selected_user_id)
            
            # Apply search filter
            if search_query:
                query = query.filter(Expense.description.ilike(f"%{search_query}%"))
            
            expenses = query.all()

            expense_data = [
                {
                    'expense_id': exp.Expense.expense_id,
                    'category': exp.name,
                    'amount': exp.Expense.amount,
                    'date': exp.Expense.date.strftime("%d-%m-%Y"),
                    'description': exp.Expense.description or "N/A"
                } for exp in expenses
            ]

            # Prepare data for chart
            category_totals = {}
            for exp in expenses:
                category_totals[exp.name] = category_totals.get(exp.name, 0) + exp.Expense.amount

    return render_template(
        'index.html',
        user_ids=user_ids,
        selected_user_id=selected_user_id,
        search_query=search_query,
        expenses=expense_data,
        category_totals=category_totals
    )

# Route to download CSV
@app.route('/download/csv')
def download_csv():
    selected_user_id = request.args.get('user_id', type=int)
    expenses = db.session.query(Expense, Category.name).join(Category).filter(Expense.user_id == selected_user_id).all()

    # Prepare data
    data = {
        'Expense ID': [exp.Expense.expense_id for exp in expenses],
        'Category': [exp.name for exp in expenses],
        'Amount': [exp.Expense.amount for exp in expenses],
        'Date': [exp.Expense.date.strftime("%d-%m-%Y") for exp in expenses],
        'Description': [exp.Expense.description or "N/A" for exp in expenses]
    }
    df = pd.DataFrame(data)

    # Write to CSV
    output = BytesIO()
    df.to_csv(output, index=False, encoding='utf-8')
    output.seek(0)

    return send_file(output, as_attachment=True, download_name='expenses.csv', mimetype='text/csv')


# Route to download Excel
@app.route('/download/excel')
def download_excel():
    selected_user_id = request.args.get('user_id', type=int)
    expenses = db.session.query(Expense, Category.name).join(Category).filter(Expense.user_id == selected_user_id).all()

    # Create Excel data
    data = {
        'Expense ID': [exp.Expense.expense_id for exp in expenses],
        'Category': [exp.name for exp in expenses],
        'Amount': [exp.Expense.amount for exp in expenses],
        'Date': [exp.Expense.date.strftime("%d-%m-%Y") for exp in expenses],
        'Description': [exp.Expense.description or "N/A" for exp in expenses]
    }
    df = pd.DataFrame(data)

    output = BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name='Expenses')
    output.seek(0)

    return send_file(output, as_attachment=True, download_name='expenses.xlsx', mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

# Route to download PDF
@app.route('/download/pdf')
def download_pdf():
    selected_user_id = request.args.get('user_id', type=int)
    expenses = db.session.query(Expense, Category.name).join(Category).filter(Expense.user_id == selected_user_id).all()

    # Prepare data
    data = [['Expense ID', 'Category', 'Amount', 'Date', 'Description']]  # Header row
    data += [
        [exp.Expense.expense_id, exp.name, f"{exp.Expense.amount:.2f}", exp.Expense.date.strftime("%Y-%m-%d"), exp.Expense.description or "N/A"]
        for exp in expenses
    ]

    # Create a BytesIO stream
    pdf_output = BytesIO()
    doc = SimpleDocTemplate(pdf_output, pagesize=letter)

    # Define styles
    styles = getSampleStyleSheet()
    centered_title_style = ParagraphStyle(
        name='CenteredTitle',
        parent=styles['Heading1'],
        alignment=1,  # 1 for center alignment
    )

    # Title
    title = Paragraph("Expense Report", centered_title_style)

    # Add some spacing
    spacer = Spacer(1, 12)

    # Create table
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))

    # Build PDF
    elements = [title, spacer, table]
    doc.build(elements)
    pdf_output.seek(0)

    return send_file(
        pdf_output,
        as_attachment=True,
        download_name="expenses.pdf",
        mimetype="application/pdf"
    )
        
if __name__ == '__main__':
    app.run(debug=True)