import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from "primeng/card";
import { ButtonModule } from 'primeng/button';
import { marked } from 'marked';
import { jsPDF } from 'jspdf';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-recipe-plan',
  imports: [CommonModule, Card, ButtonModule],
  templateUrl: './recipe-plan.html',
  styleUrl: './recipe-plan.css',
})
export class RecipePlan implements OnChanges {
  @Input() markdownContent: string = '';
  htmlContent: SafeHtml = '';
  isGeneratingPdf = false;

  constructor(private sanitizer: DomSanitizer) {
    // Configure marked to open links in new tabs
    const renderer = new marked.Renderer();
    const originalLinkRenderer = renderer.link.bind(renderer);
    
    renderer.link = function(token: any) {
      const html = originalLinkRenderer(token);
      return html.replace(/^<a /, '<a target="_blank" rel="noopener noreferrer" class="recipe-link" ');
    };
    
    marked.setOptions({ renderer });
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['markdownContent'] && this.markdownContent) {
      const html = await marked(this.markdownContent);
      this.htmlContent = this.sanitizer.sanitize(1, html) || '';
    }
  }

  async downloadAsPdf() {
    this.isGeneratingPdf = true;
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Parse the markdown to extract content and links
      const lines = this.markdownContent.split('\n');
      let yPosition = 15;
      const pageWidth = 190;
      const lineHeight = 5;
      const margin = 10;
      
      pdf.setFont('helvetica');
      
      for (const line of lines) {
        // Check if we need a new page
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 15;
        }

        // Handle headers
        if (line.startsWith('# ')) {
          pdf.setFontSize(18);
          pdf.setFont('helvetica', 'bold');
          pdf.text(line.substring(2), margin, yPosition);
          yPosition += 10;
        } else if (line.startsWith('## ')) {
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text(line.substring(3), margin, yPosition);
          yPosition += 8;
        } else if (line.startsWith('### ')) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(line.substring(4), margin, yPosition);
          yPosition += 7;
        } 
        // Handle links [text](url)
        else if (line.includes('[') && line.includes('](')) {
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
          
          const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
          let lastIndex = 0;
          let xPosition = margin;
          let match;
          
          while ((match = linkRegex.exec(line)) !== null) {
            // Add text before link
            const beforeText = line.substring(lastIndex, match.index);
            if (beforeText) {
              pdf.text(beforeText, xPosition, yPosition);
              xPosition += pdf.getTextWidth(beforeText);
            }
            
            // Add clickable link
            const linkText = match[1];
            const linkUrl = match[2];
            pdf.setTextColor(0, 102, 204);
            pdf.textWithLink(linkText, xPosition, yPosition, { url: linkUrl });
            xPosition += pdf.getTextWidth(linkText);
            pdf.setTextColor(0, 0, 0);
            
            lastIndex = match.index + match[0].length;
          }
          
          // Add remaining text
          const remainingText = line.substring(lastIndex);
          if (remainingText) {
            pdf.text(remainingText, xPosition, yPosition);
          }
          
          yPosition += lineHeight;
        }
        // Handle list items
        else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
          const text = line.trim().substring(2);
          const splitText = pdf.splitTextToSize(text, pageWidth - 20);
          pdf.text('• ' + splitText[0], margin + 5, yPosition);
          for (let i = 1; i < splitText.length; i++) {
            yPosition += lineHeight;
            pdf.text('  ' + splitText[i], margin + 5, yPosition);
          }
          yPosition += lineHeight;
        }
        // Handle bold text
        else if (line.includes('**')) {
          pdf.setFontSize(11);
          const parts = line.split('**');
          let xPosition = margin;
          for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 0) {
              pdf.setFont('helvetica', 'normal');
            } else {
              pdf.setFont('helvetica', 'bold');
            }
            pdf.text(parts[i], xPosition, yPosition);
            xPosition += pdf.getTextWidth(parts[i]);
          }
          yPosition += lineHeight;
        }
        // Regular text
        else if (line.trim()) {
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
          const splitText = pdf.splitTextToSize(line, pageWidth);
          pdf.text(splitText, margin, yPosition);
          yPosition += lineHeight * splitText.length;
        } else {
          yPosition += 3; // Empty line spacing
        }
      }

      pdf.save('meal-plan.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      this.isGeneratingPdf = false;
    }
  }
}
